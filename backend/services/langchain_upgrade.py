"""Resume upgrade — section-by-section Gemini calls with optional SSE streaming."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any, AsyncGenerator, Optional

from schemas.resume import Bullet, Resume
from services.gemini import _generate_content_rest, _stream_generate_content_rest
from services.resume_topics import UpgradeSection, plan_upgrade_sections

log = logging.getLogger("resume_upgrade")

MAX_SECTION_TOKENS = int(os.getenv("GEMINI_SECTION_MAX_TOKENS", "2048"))

SYSTEM_BASE = """You are an expert ATS resume writer.

Return ONLY valid JSON. No markdown fences. No prose outside JSON.
Never invent employers, dates, metrics, or tools not implied by the source.
Use strong action verbs. Quantify ONLY when the source already has numbers."""


def _apply_headline_summary(resume: Resume, data: dict[str, Any]) -> None:
    if "headline" in data and data["headline"] is not None:
        resume.headline = str(data["headline"]).strip()[:200]
    if "summary" in data and data["summary"] is not None:
        resume.summary = str(data["summary"]).strip()[:600]


def _apply_experience_bullets(
    resume: Resume, index: int, data: dict[str, Any]
) -> None:
    if index < 0 or index >= len(resume.experience):
        return
    raw = data.get("bullets") or []
    bullets = [
        Bullet(
            text=str(b.get("text", b) if isinstance(b, dict) else b).strip()[:500]
        )
        for b in raw
        if str(b.get("text", b) if isinstance(b, dict) else b).strip()
    ][:6]
    if bullets:
        resume.experience[index].bullets = bullets


def _apply_project_bullets(
    resume: Resume, index: int, data: dict[str, Any]
) -> None:
    if not resume.projects or index < 0 or index >= len(resume.projects):
        return
    raw = data.get("bullets") or []
    bullets = [
        Bullet(
            text=str(b.get("text", b) if isinstance(b, dict) else b).strip()[:500]
        )
        for b in raw
        if str(b.get("text", b) if isinstance(b, dict) else b).strip()
    ][:5]
    desc = data.get("description")
    if isinstance(desc, str) and desc.strip():
        resume.projects[index].description = desc.strip()[:400]
    if bullets:
        resume.projects[index].bullets = bullets


def _parse_section_json(buffer: str) -> dict[str, Any]:
    text = buffer.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(
            ln for ln in lines if not ln.strip().startswith("```")
        ).strip()
    return json.loads(text)


def _section_prompt(
    section: UpgradeSection,
    *,
    jd_text: Optional[str] = None,
) -> tuple[str, str]:
    topics_block = (
        "\n".join(f"- {t}" for t in section.topics)
        if section.topics
        else "- (derive themes from the original bullets)"
    )
    bullets_block = (
        "\n".join(f"- {b}" for b in section.original_bullets)
        if section.original_bullets
        else "- (none provided)"
    )
    jd_block = (
        f"\n\nTarget job description (align wording, do not fabricate):\n{jd_text[:6000]}"
        if jd_text
        else ""
    )

    if section.kind == "headline":
        human = (
            f'Section header: "{section.header}"\n'
            f"Themes from resume:\n{topics_block}\n\n"
            'Return JSON: {{"headline":"<one line, max 120 chars>"}}'
            f"{jd_block}"
        )
        return SYSTEM_BASE, human

    if section.kind == "summary":
        human = (
            f'Section: "{section.header}"\n'
            f"Key themes to reflect:\n{topics_block}\n\n"
            'Return JSON: {{"summary":"<2-3 sentences, max 400 chars>"}}'
            f"{jd_block}"
        )
        return SYSTEM_BASE, human

    if section.kind == "experience":
        human = (
            f'Job: "{section.header}"\n'
            f"Topic headers from original bullets (cover each with a strong bullet):\n"
            f"{topics_block}\n\n"
            f"Original bullets:\n{bullets_block}\n\n"
            f"Write one improved bullet per topic where possible (max 6). "
            f"Keep facts; improve clarity and impact.\n"
            f'Return JSON: {{"index":{section.index},"bullets":[{{"text":"..."}}]}}'
            f"{jd_block}"
        )
        return SYSTEM_BASE, human

    human = (
        f'Project: "{section.header}"\n'
        f"Topics:\n{topics_block}\n\n"
        f"Original content:\n{bullets_block}\n\n"
        f'Return JSON: {{"index":{section.index},"description":"<1 sentence>",'
        f'"bullets":[{{"text":"..."}}]}}'
        f"{jd_block}"
    )
    return SYSTEM_BASE, human


def _generate_section_sync(system: str, human: str) -> str:
    return _generate_content_rest(
        user_text=human,
        system_instruction=system,
        temperature=0.25,
        response_mime_type="application/json",
        max_output_tokens=MAX_SECTION_TOKENS,
    )


async def _stream_section_text(system: str, human: str) -> AsyncGenerator[str, None]:
    async for delta in _stream_generate_content_rest(
        user_text=human,
        system_instruction=system,
        temperature=0.25,
        response_mime_type="application/json",
        max_output_tokens=MAX_SECTION_TOKENS,
    ):
        yield delta


def _apply_section(
    working: Resume, section: UpgradeSection, data: dict[str, Any]
) -> None:
    if section.kind == "headline":
        _apply_headline_summary(working, data)
    elif section.kind == "summary":
        _apply_headline_summary(working, data)
    elif section.kind == "experience" and section.index is not None:
        _apply_experience_bullets(working, section.index, data)
    elif section.kind == "project" and section.index is not None:
        _apply_project_bullets(working, section.index, data)


def _sse(data: dict[str, Any]) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


async def upgrade_resume(
    *,
    base_resume: Resume,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
) -> Resume:
    """Upgrade parsed resume section-by-section (topics from original bullets)."""

    working = base_resume.model_copy(deep=True)
    sections = plan_upgrade_sections(working)

    if target_role and not working.headline:
        working.headline = target_role.strip()[:200]

    extra = (instruction or "").strip()
    if extra:
        jd_text = (jd_text or "") + f"\n\nExtra instruction: {extra}"

    for section in sections:
        system, human = _section_prompt(section, jd_text=jd_text)
        try:
            text = await asyncio.to_thread(_generate_section_sync, system, human)
            data = _parse_section_json(text)
            _apply_section(working, section, data)
            log.info("Upgraded section %s", section.section_id)
        except Exception as exc:
            log.warning("Section %s skipped: %s", section.section_id, exc)

    return working


async def upgrade_resume_stream_sse(
    *,
    base_resume: Resume,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    instruction: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """Stream upgrade progress as SSE resume JSON deltas + section events."""

    working = base_resume.model_copy(deep=True)
    sections = plan_upgrade_sections(working)

    if target_role and not working.headline:
        working.headline = target_role.strip()[:200]

    extra = (instruction or "").strip()
    if extra:
        jd_text = (jd_text or "") + f"\n\nExtra instruction: {extra}"

    yield _sse({"event": "start", "total_sections": len(sections)})

    for index, section in enumerate(sections):
        yield _sse(
            {
                "event": "section_start",
                "section_id": section.section_id,
                "header": section.header,
                "kind": section.kind,
                "index": index,
                "total": len(sections),
            }
        )

        system, human = _section_prompt(section, jd_text=jd_text)
        buffer = ""
        try:
            async for delta in _stream_section_text(system, human):
                buffer += delta
                yield _sse(
                    {
                        "event": "section_delta",
                        "section_id": section.section_id,
                        "delta": delta,
                    }
                )

            data = _parse_section_json(buffer)
            _apply_section(working, section, data)
            log.info("Stream upgraded section %s", section.section_id)

            yield _sse(
                {
                    "event": "section_done",
                    "section_id": section.section_id,
                    "header": section.header,
                    "kind": section.kind,
                    "index": index,
                    "total": len(sections),
                }
            )
        except Exception as exc:
            log.warning("Stream section %s skipped: %s", section.section_id, exc)
            yield _sse(
                {
                    "event": "section_error",
                    "section_id": section.section_id,
                    "error": str(exc),
                }
            )

    yield _sse({"event": "done", "resume": working.model_dump(mode="json")})
    yield "data: [DONE]\n\n"
