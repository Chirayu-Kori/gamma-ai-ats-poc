from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services import storage
from services.design_chat import design_chat
from services.field_rewrite import rewrite_resume_field

router = APIRouter(prefix="/api/resumes", tags=["ai-edit"])


class RewriteBody(BaseModel):
    path: str = Field(..., min_length=1)
    field_html: str
    selection_text: Optional[str] = None
    instruction: Optional[str] = None


class RewriteResponse(BaseModel):
    revised_html: str


class ChatMessage(BaseModel):
    role: str
    content: str


class DesignChatBody(BaseModel):
    message: str = Field(..., min_length=1)
    theme: dict = Field(default_factory=dict)
    template_id: str = "minimal"
    history: list[ChatMessage] = Field(default_factory=list)


class DesignChatResponse(BaseModel):
    message: str
    theme: Optional[dict] = None
    template_id: Optional[str] = None


@router.post("/{resume_id}/rewrite", response_model=RewriteResponse)
def rewrite_field(resume_id: str, body: RewriteBody) -> RewriteResponse:
    if storage.get_resume(resume_id) is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    if not body.field_html.strip():
        raise HTTPException(400, "field_html is required")
    try:
        revised = rewrite_resume_field(
            field_path=body.path,
            field_html=body.field_html,
            selection_text=body.selection_text,
            instruction=body.instruction,
        )
    except Exception as exc:
        raise HTTPException(502, f"Rewrite failed: {exc}") from exc
    return RewriteResponse(revised_html=revised)


@router.post("/{resume_id}/design-chat", response_model=DesignChatResponse)
def resume_design_chat(resume_id: str, body: DesignChatBody) -> DesignChatResponse:
    if storage.get_resume(resume_id) is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    try:
        result = design_chat(
            user_message=body.message,
            current_theme=body.theme,
            current_template_id=body.template_id,
            history=[m.model_dump() for m in body.history],
        )
    except Exception as exc:
        raise HTTPException(502, f"Design chat failed: {exc}") from exc
    return DesignChatResponse(
        message=result.get("message", ""),
        theme=result.get("theme"),
        template_id=result.get("template_id"),
    )
