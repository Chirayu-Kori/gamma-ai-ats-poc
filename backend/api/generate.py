from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from schemas.resume import Resume
from services import storage
from services.langchain_upgrade import upgrade_resume

router = APIRouter(prefix="/api/resumes", tags=["generate"])


class GenerateRequest(BaseModel):
    resume_id: Optional[str] = None
    resume: Optional[Resume] = None
    source_text: Optional[str] = None
    jd_text: Optional[str] = None
    target_role: Optional[str] = None
    instruction: Optional[str] = None


class GenerateResponse(BaseModel):
    resume: Resume


@router.post("/generate", response_model=GenerateResponse)
async def generate_resume(body: GenerateRequest) -> GenerateResponse:
    """One-shot AI upgrade of a parsed resume (no streaming)."""

    jd_text = body.jd_text
    base_resume = body.resume

    if body.resume_id:
        record = storage.get_resume(body.resume_id)
        if record is None:
            raise HTTPException(404, f"Resume {body.resume_id} not found")
        base_resume = record.resume
        if jd_text is None:
            jd_text = record.jd_text

    if base_resume is None:
        raise HTTPException(
            400,
            "Resume upgrade requires a parsed resume (resume_id or resume).",
        )

    try:
        upgraded = await upgrade_resume(
            base_resume=base_resume,
            jd_text=jd_text,
            target_role=body.target_role,
            instruction=body.instruction,
        )
    except Exception as exc:
        raise HTTPException(502, f"Resume upgrade failed: {exc}") from exc

    return GenerateResponse(resume=upgraded)
