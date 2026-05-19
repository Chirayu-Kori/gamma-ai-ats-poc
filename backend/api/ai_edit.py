from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from schemas.resume import Resume
from services import storage
from services.design_chat import design_chat
from services.field_rewrite import rewrite_resume_field
from services.resume_context import build_resume_context
from services.section_rewrite import rewrite_resume_section

router = APIRouter(prefix="/api/resumes", tags=["ai-edit"])


class RewriteBody(BaseModel):
    path: str = Field(..., min_length=1)
    field_html: str
    selection_text: Optional[str] = None
    instruction: Optional[str] = None
    resume_context: Optional[str] = None


class RewriteResponse(BaseModel):
    revised_html: str


class SectionFieldInput(BaseModel):
    path: str
    label: str = ""
    content: str = ""


class RewriteSectionBody(BaseModel):
    section_id: str
    section_type: str
    section_title: str = ""
    fields: list[SectionFieldInput] = Field(default_factory=list)
    instruction: Optional[str] = None
    resume_context: Optional[str] = None


class SectionUpdateOut(BaseModel):
    path: str
    value: str


class RewriteSectionResponse(BaseModel):
    updates: list[SectionUpdateOut]


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


def _resolve_resume_context(
    record_resume: Resume | None,
    jd_text: str | None,
    client_context: str | None,
    *,
    editing_section_type: str | None = None,
    editing_section_title: str | None = None,
) -> str:
    if client_context and client_context.strip():
        return client_context.strip()
    if record_resume is None:
        return ""
    return build_resume_context(
        record_resume,
        jd_text=jd_text,
        editing_section_type=editing_section_type,
        editing_section_title=editing_section_title,
    )


@router.post("/{resume_id}/rewrite", response_model=RewriteResponse)
def rewrite_field(resume_id: str, body: RewriteBody) -> RewriteResponse:
    record = storage.get_resume(resume_id)
    if record is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    if not body.field_html.strip():
        raise HTTPException(400, "field_html is required")
    context = _resolve_resume_context(
        record.resume,
        record.jd_text,
        body.resume_context,
    )
    try:
        revised = rewrite_resume_field(
            field_path=body.path,
            field_html=body.field_html,
            selection_text=body.selection_text,
            resume_context=context or None,
            instruction=body.instruction,
        )
    except Exception as exc:
        raise HTTPException(502, f"Rewrite failed: {exc}") from exc
    return RewriteResponse(revised_html=revised)


@router.post("/{resume_id}/rewrite-section", response_model=RewriteSectionResponse)
def rewrite_section(resume_id: str, body: RewriteSectionBody) -> RewriteSectionResponse:
    record = storage.get_resume(resume_id)
    if record is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    if not body.fields:
        raise HTTPException(400, "Section has no editable fields")
    context = _resolve_resume_context(
        record.resume,
        record.jd_text,
        body.resume_context,
        editing_section_type=body.section_type,
        editing_section_title=body.section_title or body.section_type,
    )
    try:
        raw = rewrite_resume_section(
            section_type=body.section_type,
            section_title=body.section_title or body.section_type,
            fields=[f.model_dump() for f in body.fields],
            resume_context=context or None,
            instruction=body.instruction,
        )
    except Exception as exc:
        raise HTTPException(502, f"Section rewrite failed: {exc}") from exc
    updates = [
        SectionUpdateOut(path=str(u.get("path", "")), value=str(u.get("value", "")))
        for u in raw
        if u.get("path")
    ]
    return RewriteSectionResponse(updates=updates)


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
