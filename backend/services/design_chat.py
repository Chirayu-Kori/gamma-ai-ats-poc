"""Design assistant — theme/template suggestions from natural language."""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from services.gemini import _generate_content_rest

log = logging.getLogger("design_chat")

VALID_TEMPLATES = frozenset(
    {
        "minimal",
        "executive",
        "modern",
        "classic",
        "bold",
        "compact",
        "creative",
        "atlantic",
        "stripe",
    }
)

DESIGN_CHAT_SCHEMA = {
    "type": "object",
    "properties": {
        "message": {"type": "string"},
        "theme": {
            "type": "object",
            "properties": {
                "accent": {"type": "string"},
                "sidebarColor": {"type": "string"},
                "headingColor": {"type": "string"},
                "textColor": {"type": "string"},
                "backgroundColor": {"type": "string"},
                "fontHeading": {"type": "string"},
                "fontBody": {"type": "string"},
            },
        },
        "template_id": {"type": "string"},
    },
    "required": ["message"],
}

DESIGN_CHAT_SYSTEM = """You are a resume design assistant. The user chats to adjust visual design (colors, fonts, template).

Return JSON with:
- message: short friendly reply explaining what you changed or suggesting next steps.
- theme (optional): only keys you want to change — hex colors (#rrggbb) and CSS font-family strings.
- template_id (optional): one of: minimal, executive, modern, classic, bold, compact, creative, atlantic, stripe.

Do not change resume text content. Prefer subtle, readable professional palettes.
If the user asks for something you cannot do (e.g. move sections), explain in message and suggest Design panel actions."""


def design_chat(
    *,
    user_message: str,
    current_theme: dict[str, Any],
    current_template_id: str,
    history: Optional[list[dict[str, str]]] = None,
) -> dict[str, Any]:
    hist_lines = []
    for item in (history or [])[-8:]:
        role = item.get("role", "user")
        content = (item.get("content") or "").strip()
        if content:
            hist_lines.append(f"{role.upper()}: {content}")

    context = [
        f"CURRENT TEMPLATE: {current_template_id}",
        f"CURRENT THEME JSON:\n{json.dumps(current_theme, indent=0)}",
    ]
    if hist_lines:
        context.append("RECENT CHAT:\n" + "\n".join(hist_lines))
    context.append(f"USER:\n{user_message.strip()}")

    text = _generate_content_rest(
        user_text="\n\n".join(context),
        system_instruction=DESIGN_CHAT_SYSTEM,
        temperature=0.55,
        response_schema=DESIGN_CHAT_SCHEMA,
        response_mime_type="application/json",
        max_output_tokens=2048,
    )
    data = json.loads(text)
    tpl = data.get("template_id")
    if tpl and tpl not in VALID_TEMPLATES:
        data.pop("template_id", None)
    theme = data.get("theme")
    if isinstance(theme, dict):
        data["theme"] = {
            k: str(v)
            for k, v in theme.items()
            if k
            in (
                "accent",
                "sidebarColor",
                "headingColor",
                "textColor",
                "backgroundColor",
                "fontHeading",
                "fontBody",
            )
            and v
        }
    data["message"] = (data.get("message") or "Done.").strip()
    return data
