"""Gemini integration via direct REST calls.

We deliberately do NOT use the `google-genai` SDK. The 0.x SDK has a bug
where `_from_response` calls `json.loads(response.text)` unconditionally to
populate `result.parsed`, and crashes the entire request if the text isn't
strict JSON. That kept biting both streaming (partial chunks) and one-shot
(full response with any quirk). Calling Gemini's REST API directly with
httpx removes the SDK from the picture entirely.

Endpoints used:
  POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...

We always parse the JSON envelope ourselves and extract
`candidates[0].content.parts[*].text`.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
from typing import AsyncGenerator, Optional

import httpx

from schemas.resume import Bullet, Resume, ResumeUpgradeDelta

log = logging.getLogger("gemini")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MAX_OUTPUT_TOKENS = 16384
# Structured resume JSON is typically 3–8k tokens; cap prevents runaway prose.
UPGRADE_MAX_OUTPUT_TOKENS = int(
    os.getenv("GEMINI_UPGRADE_MAX_OUTPUT_TOKENS", "4096")
)

# Model sometimes ignores schema during native token streaming and narrates
# "My experience is: …" inside summary — detect and retry.
_NARRATIVE_MARKERS = (
    "My experience is",
    "My education is",
    "My skills are",
    "My projects are",
    "My contact information is",
    "My certifications are",
    "My headline is",
    "My name is:",
)


def _api_key() -> str:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key or key == "your_gemini_api_key_here":
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Set it in backend/.env."
        )
    return key


def _sanitize_schema_for_gemini(schema: dict) -> dict:
    """Google AI rejects JSON-Schema keys like `title`, `default`, `$defs`, `$ref`.

    Inlines refs, drops unsupported keys, collapses Pydantic Optional anyOfs
    into a nullable schema.
    """

    defs = schema.get("$defs", {}) or schema.get("definitions", {}) or {}
    DROP = {
        "title",
        "default",
        "$defs",
        "definitions",
        "$schema",
        "examples",
        "additionalProperties",
        "discriminator",
    }

    def _resolve(node):
        if isinstance(node, dict):
            if "$ref" in node:
                ref = node["$ref"]
                key = ref.rsplit("/", 1)[-1]
                target = defs.get(key)
                if target is None:
                    return {}
                merged = {k: v for k, v in node.items() if k != "$ref"}
                resolved = _resolve(target)
                resolved.update(merged)
                return _resolve(resolved)

            if "anyOf" in node and isinstance(node["anyOf"], list):
                branches = [b for b in node["anyOf"] if isinstance(b, dict)]
                non_null = [b for b in branches if b.get("type") != "null"]
                if len(non_null) == 1 and len(branches) <= 2:
                    inner = _resolve(non_null[0])
                    inner.setdefault("nullable", True)
                    for k, v in node.items():
                        if k == "anyOf" or k in DROP:
                            continue
                        inner[k] = _resolve(v)
                    return inner

            out = {}
            for k, v in node.items():
                if k in DROP:
                    continue
                out[k] = _resolve(v)
            return out
        if isinstance(node, list):
            return [_resolve(x) for x in node]
        return node

    cleaned = _resolve(schema)
    cleaned.pop("$defs", None)
    cleaned.pop("definitions", None)
    return cleaned


RESUME_SCHEMA = _sanitize_schema_for_gemini(Resume.model_json_schema())


PARSE_SYSTEM_PROMPT = """You extract resume content from documents and images.

Return a JSON object that matches the schema exactly. If a field is unknown leave
it empty (empty string, null, or empty list). Never invent companies, dates, or
numbers. Preserve original phrasing - this is parsing, not rewriting."""


UPGRADE_DELTA_SYSTEM_PROMPT = """You improve resume wording. You receive a compact JSON snapshot of a resume.

Return ONLY a small JSON patch with these optional keys:
- headline: improved one-line headline (max 120 chars)
- summary: 2–3 sentence professional summary (max 400 chars)
- experience: array of {index, bullets:[{text}]} — rewritten bullets ONLY

RULES:
- Do NOT return the full resume, contact info, education, skills, or projects.
- Use the same `index` values from the input jobs list.
- Same number of bullets per job as input unless merging duplicates.
- Max 6 bullets per job; each bullet max ~200 characters.
- Strong action verbs; quantify ONLY if the source bullet had numbers.
- Never invent employers, dates, or metrics.
- No markdown, no "My experience is:", no narrative outside JSON fields."""

UPGRADE_DELTA_SCHEMA = _sanitize_schema_for_gemini(
    ResumeUpgradeDelta.model_json_schema()
)


THEME_SYSTEM_PROMPT = """You design resume themes. Given a short description,
return JSON with these exact keys:
- accent: a hex color string for accents/headings
- fontHeading: a CSS font-family string for headings
- fontBody: a CSS font-family string for body text

Pick fonts from common web-safe / Google Fonts that pair well with the
described mood. Return JSON only."""


THEME_SCHEMA = _sanitize_schema_for_gemini(
    {
        "type": "object",
        "properties": {
            "accent": {"type": "string"},
            "fontHeading": {"type": "string"},
            "fontBody": {"type": "string"},
        },
        "required": ["accent", "fontHeading", "fontBody"],
    }
)


def _generate_content_rest(
    *,
    user_text: str,
    system_instruction: str,
    temperature: float,
    response_schema: Optional[dict] = None,
    response_mime_type: Optional[str] = "application/json",
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
    file_bytes: Optional[bytes] = None,
    file_mime: Optional[str] = None,
) -> str:
    """Call Gemini REST generateContent and return concatenated output text.

    Bypasses the google-genai SDK entirely (see module docstring for why).
    """
    url = f"{GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent?key={_api_key()}"

    parts: list[dict] = []
    if file_bytes is not None and file_mime:
        parts.append(
            {
                "inlineData": {
                    "mimeType": file_mime,
                    "data": base64.b64encode(file_bytes).decode("ascii"),
                }
            }
        )
    parts.append({"text": user_text})

    gen_config: dict = {
        "temperature": temperature,
        "maxOutputTokens": max_output_tokens,
        # Disable extended "thinking" on 2.5 models. With thinking on, the
        # model's internal reasoning can leak into the structured output as
        # meta-commentary ("Self-correction: ...") and create infinite-loop
        # cascades inside string fields. Setting budget to 0 forces a
        # direct, non-reasoning answer. Ignored by non-thinking models.
        "thinkingConfig": {"thinkingBudget": 0},
    }
    if response_mime_type:
        gen_config["responseMimeType"] = response_mime_type
    if response_schema:
        gen_config["responseSchema"] = response_schema

    body = {
        "contents": [{"role": "user", "parts": parts}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": gen_config,
    }

    with httpx.Client(timeout=httpx.Timeout(180.0, connect=15.0)) as cx:
        resp = cx.post(url, json=body)

    if resp.status_code != 200:
        log.error("Gemini HTTP %s: %s", resp.status_code, resp.text[:1500])
        raise RuntimeError(
            f"Gemini HTTP {resp.status_code}: "
            f"{resp.text[:400] or resp.reason_phrase}"
        )

    try:
        data = resp.json()
    except json.JSONDecodeError as exc:
        log.error("Gemini returned non-JSON envelope: %s", resp.text[:500])
        raise RuntimeError(f"Gemini envelope was not JSON: {exc}") from exc

    candidates = data.get("candidates") or []
    if not candidates:
        feedback = data.get("promptFeedback")
        log.error("Gemini returned no candidates. feedback=%s", feedback)
        raise RuntimeError(
            f"Gemini returned no candidates. promptFeedback={feedback!r}"
        )

    cand = candidates[0]
    finish_reason = cand.get("finishReason")
    content = cand.get("content") or {}
    out_parts = content.get("parts") or []
    text_chunks = [
        p.get("text") for p in out_parts if isinstance(p.get("text"), str)
    ]
    text = "".join(text_chunks).strip()

    if finish_reason and finish_reason not in (
        "STOP",
        "FINISH_REASON_UNSPECIFIED",
        None,
    ):
        log.warning(
            "Gemini finishReason=%s (len=%d). Output may be truncated.",
            finish_reason,
            len(text),
        )

    if not text:
        raise RuntimeError(
            f"Gemini returned empty text (finishReason={finish_reason})"
        )

    return text


def _resume_prompt_json(resume: Resume) -> str:
    """Compact JSON for prompts — smaller input, faster generation."""

    data = resume.model_dump(mode="json", exclude_none=True, exclude_defaults=True)
    for exp in data.get("experience") or []:
        for bullet in exp.get("bullets") or []:
            if isinstance(bullet, dict):
                bullet.pop("impact_score", None)
                bullet.pop("keywords", None)
                bullet.pop("id", None)
    for proj in data.get("projects") or []:
        for bullet in proj.get("bullets") or []:
            if isinstance(bullet, dict):
                bullet.pop("impact_score", None)
                bullet.pop("keywords", None)
                bullet.pop("id", None)
    return json.dumps(data, separators=(",", ":"))


def _extract_text_from_candidate_chunk(data: dict) -> str:
    candidates = data.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    return "".join(
        p.get("text") for p in parts if isinstance(p.get("text"), str)
    )


async def _stream_generate_content_rest(
    *,
    user_text: str,
    system_instruction: str,
    temperature: float,
    response_schema: Optional[dict] = None,
    response_mime_type: Optional[str] = "application/json",
    max_output_tokens: int = DEFAULT_MAX_OUTPUT_TOKENS,
) -> AsyncGenerator[str, None]:
    """Stream Gemini output via REST SSE (streamGenerateContent?alt=sse)."""

    url = (
        f"{GEMINI_BASE}/models/{GEMINI_MODEL}:streamGenerateContent"
        f"?alt=sse&key={_api_key()}"
    )

    gen_config: dict = {
        "temperature": temperature,
        "maxOutputTokens": max_output_tokens,
        "thinkingConfig": {"thinkingBudget": 0},
    }
    if response_mime_type:
        gen_config["responseMimeType"] = response_mime_type
    if response_schema:
        gen_config["responseSchema"] = response_schema

    body = {
        "contents": [{"role": "user", "parts": [{"text": user_text}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": gen_config,
    }

    finish_reason: Optional[str] = None

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(180.0, connect=15.0)
    ) as cx:
        async with cx.stream("POST", url, json=body) as resp:
            if resp.status_code != 200:
                detail = (await resp.aread())[:1500].decode(
                    "utf-8", errors="replace"
                )
                log.error("Gemini stream HTTP %s: %s", resp.status_code, detail)
                raise RuntimeError(
                    f"Gemini HTTP {resp.status_code}: {detail[:400]}"
                )

            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if not payload or payload == "[DONE]":
                    continue
                try:
                    data = json.loads(payload)
                except json.JSONDecodeError:
                    continue

                candidates = data.get("candidates") or []
                if candidates:
                    reason = candidates[0].get("finishReason")
                    if reason:
                        finish_reason = reason

                delta = _extract_text_from_candidate_chunk(data)
                if delta:
                    yield delta

    if finish_reason and finish_reason not in (
        "STOP",
        "FINISH_REASON_UNSPECIFIED",
        None,
    ):
        log.warning(
            "Gemini stream finishReason=%s — output may be truncated.",
            finish_reason,
        )


# ----------------------------------------------------------------------------
# Public API used by routes
# ----------------------------------------------------------------------------


def parse_resume_file(
    file_bytes: bytes,
    mime_type: str,
    jd_text: Optional[str] = None,
) -> Resume:
    """One-shot extraction: PDF/image bytes -> structured Resume."""

    instruction = (
        "Extract the resume above into the JSON schema. "
        "Preserve original wording."
    )
    if jd_text:
        instruction += (
            "\n\nFor context, here is the job description the user wants to "
            "tailor toward (do not invent matching experience):\n\n" + jd_text
        )

    text = _generate_content_rest(
        user_text=instruction,
        system_instruction=PARSE_SYSTEM_PROMPT,
        temperature=0.1,
        response_schema=RESUME_SCHEMA,
        response_mime_type="application/json",
        file_bytes=file_bytes,
        file_mime=mime_type,
    )

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        log.error("Gemini parse returned non-JSON: %s", text[:500])
        raise RuntimeError(f"Gemini returned non-JSON: {exc}") from exc

    try:
        return Resume.model_validate(data)
    except Exception as exc:
        log.error(
            "Parse schema validation failed for: %s", json.dumps(data)[:500]
        )
        raise RuntimeError(f"Parsed JSON failed Resume schema: {exc}") from exc


def generate_theme(prompt: str) -> dict:
    text = _generate_content_rest(
        user_text=f"Theme description:\n{prompt}",
        system_instruction=THEME_SYSTEM_PROMPT,
        temperature=0.6,
        response_schema=THEME_SCHEMA,
        response_mime_type="application/json",
        max_output_tokens=1024,
    )
    return json.loads(text)


def _compact_resume_for_upgrade(resume: Resume) -> str:
    """Minimal input so the model only returns a small patch."""

    jobs = []
    for i, exp in enumerate(resume.experience or []):
        jobs.append(
            {
                "index": i,
                "company": exp.company,
                "title": exp.title,
                "start": exp.start,
                "end": exp.end,
                "bullets": [
                    b.text for b in (exp.bullets or []) if (b.text or "").strip()
                ],
            }
        )
    payload = {
        "name": resume.name,
        "headline": resume.headline,
        "summary": resume.summary,
        "jobs": jobs,
    }
    return json.dumps(payload, separators=(",", ":"))


def _build_delta_upgrade_prompt(
    *,
    base_resume: Resume,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
) -> tuple[str, str]:
    parts = [
        "RESUME SNAPSHOT (rewrite headline, summary, and job bullets only):\n"
        + _compact_resume_for_upgrade(base_resume)
    ]
    if jd_text:
        parts.append(
            "TARGET JOB DESCRIPTION (tailor bullets/summary; do not fabricate):\n"
            + jd_text.strip()[:8000]
        )
    if target_role:
        parts.append("TARGET ROLE: " + target_role.strip())
    if instruction:
        parts.append("ADDITIONAL INSTRUCTION:\n" + instruction.strip())

    system = UPGRADE_DELTA_SYSTEM_PROMPT
    if jd_text:
        system += "\n- Prioritize JD-aligned keywords in summary and bullets."
    return "\n\n".join(parts), system


def _looks_like_narrative_dump(text: str) -> bool:
    return any(marker in text for marker in _NARRATIVE_MARKERS)


def _apply_upgrade_delta(base: Resume, delta: ResumeUpgradeDelta) -> Resume:
    out = base.model_copy(deep=True)

    if delta.headline is not None:
        out.headline = (delta.headline or "").strip()[:200]
    if delta.summary is not None:
        out.summary = (delta.summary or "").strip()[:600]

    for item in delta.experience:
        idx = item.index
        if idx < 0 or idx >= len(out.experience):
            continue
        cleaned = [
            Bullet(text=(b.text or "").strip()[:500])
            for b in (item.bullets or [])
            if (b.text or "").strip()
        ][:6]
        if cleaned:
            out.experience[idx].bullets = cleaned

    return out


def _generate_upgrade_delta(
    *,
    base_resume: Resume,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
) -> ResumeUpgradeDelta:
    user_text, system = _build_delta_upgrade_prompt(
        base_resume=base_resume,
        jd_text=jd_text,
        target_role=target_role,
        instruction=instruction,
    )
    text = _generate_content_rest(
        user_text=user_text,
        system_instruction=system,
        temperature=0.2,
        response_schema=UPGRADE_DELTA_SCHEMA,
        response_mime_type="application/json",
        max_output_tokens=UPGRADE_MAX_OUTPUT_TOKENS,
    )
    if len(text) > 12000:
        raise ValueError(f"upgrade delta too large ({len(text)} chars)")
    if _looks_like_narrative_dump(text):
        raise ValueError("upgrade delta contained narrative dump")
    data = json.loads(text)
    return ResumeUpgradeDelta.model_validate(data)


def _upgrade_resume_with_retry(
    *,
    base_resume: Optional[Resume] = None,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
    **_,
) -> Resume:
    """Apply a compact LLM patch to the parsed resume (avoids full-resume regen)."""

    if base_resume is None:
        raise RuntimeError("Resume upgrade requires a parsed base resume")

    last_err: Optional[Exception] = None
    for attempt in range(2):
        try:
            delta = _generate_upgrade_delta(
                base_resume=base_resume,
                jd_text=jd_text,
                target_role=target_role,
                instruction=instruction,
            )
            merged = _apply_upgrade_delta(base_resume, delta)
            log.info(
                "Delta upgrade OK (attempt=%s, out_chars=%d)",
                attempt,
                len(merged.model_dump_json()),
            )
            return merged
        except Exception as exc:
            last_err = exc
            log.warning("Delta upgrade attempt %s failed: %s", attempt, exc)

    raise RuntimeError(
        f"Resume upgrade failed after retry: {last_err}"
    ) from last_err


async def _yield_json_chunks(
    json_text: str, chunk_size: int = 160
) -> AsyncGenerator[str, None]:
    for i in range(0, len(json_text), chunk_size):
        piece = json_text[i : i + chunk_size]
        yield f"data: {json.dumps({'delta': piece})}\n\n"
        await asyncio.sleep(0.008)


async def stream_resume_to_sse(**kwargs) -> AsyncGenerator[str, None]:
    """Deprecated — use POST /api/resumes/generate (JSON) instead."""

    err = json.dumps({"error": "Streaming is disabled. Use POST /api/resumes/generate."})
    yield f"data: {err}\n\n"
