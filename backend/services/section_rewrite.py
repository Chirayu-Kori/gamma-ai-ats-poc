"""Rewrite an entire resume section via Gemini."""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from services.gemini import _generate_content_rest

log = logging.getLogger("section_rewrite")

SECTION_REWRITE_SCHEMA = {
    "type": "object",
    "properties": {
        "updates": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "value": {"type": "string"},
                },
                "required": ["path", "value"],
            },
        }
    },
    "required": ["updates"],
}

SECTION_REWRITE_SYSTEM = """You edit one section of a resume.

You receive FULL RESUME CONTEXT (candidate facts from the rest of the resume), then the SECTION
to edit with its fields. Use the context so rewrites are specific, consistent, and grounded in
the candidate's real background — never generic filler.

Return JSON only: {"updates": [{"path": "<exact path>", "value": "<revised content>"}, ...]}.

Rules:
- Ground every bullet and sentence in facts from RESUME CONTEXT and the section's current content.
- Include an update for EVERY field listed unless the instruction says to change only some.
- Preserve HTML tags when the original content uses them (p, ul, li, strong, em).
- For plain date/company/title fields, return plain text without HTML unless input had HTML.
- For skill items paths ending in ".items", return a comma-separated list of skills.
- Do not invent employers, degrees, dates, or metrics not supported by context or existing content.
- Align with the job description when provided; do not fabricate matching experience.
- Follow the user INSTRUCTION when provided; otherwise improve clarity and ATS impact.
- Return valid JSON only. No markdown fences."""


def rewrite_resume_section(
    *,
    section_type: str,
    section_title: str,
    fields: list[dict[str, str]],
    resume_context: Optional[str] = None,
    instruction: Optional[str] = None,
) -> list[dict[str, Any]]:
    if not fields:
        raise ValueError("Section has no editable fields")

    field_lines = "\n".join(
        f'- path="{f["path"]}" label="{f.get("label", "")}"\n  content: {f.get("content", "")[:2000]}'
        for f in fields
    )
    parts: list[str] = []
    if resume_context and resume_context.strip():
        parts.append(
            "FULL RESUME CONTEXT (candidate facts — use these; stay consistent):\n"
            + resume_context.strip()[:12000]
        )
    parts.extend(
        [
            f"SECTION TYPE: {section_type}",
            f"SECTION TITLE: {section_title}",
            f"FIELDS TO EDIT:\n{field_lines}",
        ]
    )
    if instruction and instruction.strip():
        parts.append(f"INSTRUCTION:\n{instruction.strip()}")
    else:
        parts.append(
            "INSTRUCTION: Improve the entire section for clarity, impact, and professional tone."
        )

    text = _generate_content_rest(
        user_text="\n\n".join(parts),
        system_instruction=SECTION_REWRITE_SYSTEM,
        temperature=0.45,
        response_schema=SECTION_REWRITE_SCHEMA,
        response_mime_type="application/json",
        max_output_tokens=8192,
    )
    data = json.loads(text)
    updates = data.get("updates") or []
    if not isinstance(updates, list):
        raise ValueError("Invalid updates from model")
    log.info("Section rewrite %s: %d updates", section_type, len(updates))
    return updates
