"""Gemini integration: parse uploaded resume, stream generation, theme synth."""

from __future__ import annotations

import json
import logging
import os
from typing import AsyncGenerator, Iterable, Optional

import httpx
from google import genai
from google.genai import types

from schemas.resume import Resume

log = logging.getLogger("gemini")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.strip() in {"", "your_gemini_api_key_here"}:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured. Set it in backend/.env."
            )
        _client = genai.Client(api_key=api_key)
    return _client


def _sanitize_schema_for_gemini(schema: dict) -> dict:
    """Google AI rejects JSON-Schema keys like `title`, `default`, `$defs`, `$ref`.

    This walker:
      1. Resolves every `$ref` against the top-level `$defs` map.
      2. Strips keys Google AI does not accept.
      3. Recurses into `properties`, `items`, `anyOf`, `oneOf`, `allOf`.
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

            # Collapse `anyOf: [<schema>, {"type": "null"}]` (Pydantic Optional)
            # into the non-null branch + nullable hint.
            if "anyOf" in node and isinstance(node["anyOf"], list):
                branches = [b for b in node["anyOf"] if isinstance(b, dict)]
                non_null = [b for b in branches if b.get("type") != "null"]
                if len(non_null) == 1 and len(branches) <= 2:
                    inner = _resolve(non_null[0])
                    inner.setdefault("nullable", True)
                    for k, v in node.items():
                        if k == "anyOf":
                            continue
                        if k in DROP:
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


UPGRADE_SYSTEM_PROMPT_BASE = """You are an expert resume writer producing ATS-friendly content.

Rules:
- Rewrite bullets to lead with strong action verbs and quantify impact when the
  original contains numbers; never invent numbers.
- Surface achievements over responsibilities.
- Remove cliches ("results-driven", "team player", "go-getter").
- Preserve every factual claim: dates, employers, titles, education.
- Match the schema exactly. Emit fields in order: name, headline, contact,
  summary, experience, education, skills, projects, certifications.
- Each section's bullets array must contain Bullet objects ({"text": "..."}),
  not plain strings."""


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


def _file_part(data: bytes, mime_type: str) -> types.Part:
    """Build a Part for an inline binary upload, tolerating SDK arg variants."""
    try:
        return types.Part.from_bytes(data=data, mime_type=mime_type)
    except TypeError:
        # Older SDK signature
        return types.Part.from_bytes(data, mime_type)  # type: ignore[arg-type]


def parse_resume_file(
    file_bytes: bytes,
    mime_type: str,
    jd_text: Optional[str] = None,
) -> Resume:
    """One-shot extraction: PDF/image bytes -> structured Resume."""

    client = _get_client()

    instruction = (
        "Extract the resume above into the JSON schema. Preserve original wording."
    )
    if jd_text:
        instruction += (
            "\n\nFor context, here is the job description the user wants to "
            "tailor toward (do not invent matching experience):\n\n" + jd_text
        )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[_file_part(file_bytes, mime_type), instruction],
            config=types.GenerateContentConfig(
                system_instruction=PARSE_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=RESUME_SCHEMA,
                temperature=0.1,
            ),
        )
    except Exception as exc:
        log.exception("Gemini parse_resume_file failed")
        raise RuntimeError(f"Gemini call failed: {exc}") from exc

    text = (response.text or "").strip() or "{}"
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        log.error("Gemini returned non-JSON: %s", text[:500])
        raise RuntimeError(f"Gemini returned non-JSON: {exc}") from exc

    try:
        return Resume.model_validate(data)
    except Exception as exc:
        log.error("Schema validation failed for: %s", json.dumps(data)[:500])
        raise RuntimeError(f"Parsed JSON failed Resume schema: {exc}") from exc


_JSON_SHAPE_HINT = (
    "Output a single JSON object only. No prose, no markdown fences, no "
    "leading or trailing text. Start with `{` and end with `}`. "
    "Match this exact shape (all keys, even if empty):\n"
    "{\n"
    '  "name": "",\n'
    '  "headline": "",\n'
    '  "contact": {"email": null, "phone": null, "location": null,'
    ' "linkedin": null, "github": null, "website": null},\n'
    '  "summary": "",\n'
    '  "experience": [{"id": "", "company": "", "title": "", "start": "",'
    ' "end": null, "location": null,'
    ' "bullets": [{"text": "", "impact_score": null, "keywords": [], "id": ""}]}],\n'
    '  "education": [{"id": "", "institution": "", "degree": "", "field": null,'
    ' "start": null, "end": null, "gpa": null, "highlights": []}],\n'
    '  "skills": [{"category": "", "items": []}],\n'
    '  "projects": null,\n'
    '  "certifications": null\n'
    "}"
)


def _strip_code_fence(text: str, state: dict) -> str:
    """Trim a leading ```json / ``` fence off the very first emitted chunk."""
    if state.get("opened"):
        return text
    state["opened"] = True
    stripped = text.lstrip()
    if stripped.startswith("```"):
        # remove leading fence (```json or ```)
        nl = stripped.find("\n")
        if nl != -1:
            stripped = stripped[nl + 1 :]
        else:
            stripped = stripped[3:]
    return stripped


def stream_generate_resume(
    *,
    source_text: Optional[str] = None,
    base_resume: Optional[Resume] = None,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
) -> Iterable[str]:
    """Yield Gemini text chunks (partial JSON) for the upgraded resume.

    NOTE: we intentionally do not set `response_mime_type` or `response_schema`
    on streaming calls. The google-genai SDK eagerly runs `json.loads()` on
    every partial chunk when those are set, which blows up mid-stream. We
    constrain via the prompt instead, and the frontend uses `partial-json`
    to parse fragments tolerantly.
    """

    client = _get_client()

    parts: list[str] = [_JSON_SHAPE_HINT]
    if base_resume is not None:
        parts.append(
            "EXISTING RESUME JSON (preserve facts, rewrite phrasing):\n"
            + base_resume.model_dump_json(indent=2)
        )
    if source_text:
        parts.append("RAW RESUME TEXT:\n" + source_text)
    if jd_text:
        parts.append(
            "TARGET JOB DESCRIPTION (tailor toward this; do not fabricate):\n"
            + jd_text
        )
    if target_role:
        parts.append("TARGET ROLE: " + target_role)
    if instruction:
        parts.append("ADDITIONAL INSTRUCTION:\n" + instruction)

    if len(parts) == 1:
        parts.append(
            "Generate a generic ATS-friendly resume for a software engineer."
        )

    user_text = "\n\n".join(parts)

    system = UPGRADE_SYSTEM_PROMPT_BASE
    if jd_text:
        system += (
            "\n- Emphasize skills and experience that align with the JD. "
            "Reorder bullets so the most relevant impact is first."
        )

    # The google-genai SDK in some versions eagerly runs `json.loads()` on
    # every partial streaming chunk, which crashes mid-stream. We bypass the
    # SDK and call the REST `streamGenerateContent` endpoint directly.
    yield from _rest_stream_text(system, user_text, temperature=0.4)


def _rest_stream_text(
    system_instruction: str,
    user_text: str,
    temperature: float = 0.4,
) -> Iterable[str]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:streamGenerateContent?alt=sse&key={api_key}"
    )
    body = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [
            {"role": "user", "parts": [{"text": user_text}]},
        ],
        "generationConfig": {"temperature": temperature},
    }

    fence_state: dict = {}
    with httpx.Client(timeout=httpx.Timeout(180.0, connect=10.0)) as cx:
        with cx.stream("POST", url, json=body) as resp:
            if resp.status_code != 200:
                # Drain to get error body for the log
                err_bytes = b"".join(resp.iter_bytes())
                log.error(
                    "Gemini REST stream HTTP %s: %s",
                    resp.status_code,
                    err_bytes[:1000],
                )
                raise RuntimeError(
                    f"Gemini stream HTTP {resp.status_code}: "
                    f"{err_bytes[:300].decode('utf-8', errors='ignore')}"
                )

            buffer = ""
            for raw in resp.iter_text():
                if not raw:
                    continue
                buffer += raw
                # SSE frames are separated by blank lines
                while "\n\n" in buffer:
                    frame, buffer = buffer.split("\n\n", 1)
                    for line in frame.splitlines():
                        if not line.startswith("data:"):
                            continue
                        payload = line[5:].strip()
                        if not payload or payload == "[DONE]":
                            continue
                        try:
                            obj = json.loads(payload)
                        except json.JSONDecodeError:
                            log.warning("Skipping un-parsable SSE payload")
                            continue
                        text = _extract_text_from_event(obj)
                        if not text:
                            continue
                        cleaned = _strip_code_fence(text, fence_state)
                        if cleaned:
                            yield cleaned


def _extract_text_from_event(obj: dict) -> str:
    """Pull concatenated `text` parts out of a GenerateContentResponse event."""
    candidates = obj.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    out: list[str] = []
    for p in parts:
        t = p.get("text")
        if isinstance(t, str):
            out.append(t)
    return "".join(out)


def generate_theme(prompt: str) -> dict:
    client = _get_client()
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=f"Theme description:\n{prompt}",
        config=types.GenerateContentConfig(
            system_instruction=THEME_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=THEME_SCHEMA,
            temperature=0.6,
        ),
    )
    return json.loads(response.text or "{}")


async def stream_resume_to_sse(**kwargs) -> AsyncGenerator[str, None]:
    """Wrap the sync generator as async SSE frames."""

    try:
        for chunk in stream_generate_resume(**kwargs):
            payload = json.dumps({"delta": chunk})
            yield f"data: {payload}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as exc:
        log.exception("Generate stream failed")
        err = json.dumps({"error": str(exc)})
        yield f"data: {err}\n\n"
