"""Rewrite a single resume field (or selection) via Gemini."""

from __future__ import annotations

import json
import logging
from typing import Optional

from services.gemini import _generate_content_rest

log = logging.getLogger("field_rewrite")

REWRITE_SCHEMA = {
    "type": "object",
    "properties": {"revised_html": {"type": "string"}},
    "required": ["revised_html"],
}

REWRITE_SYSTEM = """You edit resume content for a single field.

Rules:
- Return JSON only: {"revised_html": "<full field HTML after edit>"}.
- Preserve valid HTML tags used in the input (p, ul, ol, li, strong, em, u, span).
- Professional resume tone; no markdown fences or commentary.
- If SELECTION is provided, rewrite only that portion but return the COMPLETE field HTML with the selection replaced.
- If INSTRUCTION is provided, follow it while keeping facts accurate; do not invent employers, dates, or degrees.
- If no instruction, improve clarity and impact while preserving meaning.
- For plain-text fields (no HTML tags), return plain text without wrapping in <p> unless the input used HTML."""


def rewrite_resume_field(
    *,
    field_path: str,
    field_html: str,
    selection_text: Optional[str] = None,
    instruction: Optional[str] = None,
) -> str:
    parts = [f"FIELD PATH: {field_path}", f"FULL FIELD CONTENT:\n{field_html.strip()}"]
    if selection_text and selection_text.strip():
        parts.append(f"SELECTION TO REWRITE:\n{selection_text.strip()}")
    if instruction and instruction.strip():
        parts.append(f"INSTRUCTION:\n{instruction.strip()}")
    else:
        parts.append("INSTRUCTION: Improve clarity and professional impact.")

    user_text = "\n\n".join(parts)
    text = _generate_content_rest(
        user_text=user_text,
        system_instruction=REWRITE_SYSTEM,
        temperature=0.45,
        response_schema=REWRITE_SCHEMA,
        response_mime_type="application/json",
        max_output_tokens=4096,
    )
    data = json.loads(text)
    revised = (data.get("revised_html") or "").strip()
    if not revised:
        raise ValueError("Rewrite returned empty content")
    log.info("Rewrote field %s (%d chars)", field_path, len(revised))
    return revised
