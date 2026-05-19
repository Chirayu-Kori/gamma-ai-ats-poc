from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from schemas.resume import Resume, ResumeMeta, ResumeRecord
from services import storage
from services.resume_diff import ResumeDiff, compute_resume_diff

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


class CreateResumeBody(BaseModel):
    label: Optional[str] = None
    resume: Optional[Resume] = None
    template_id: Optional[str] = None
    theme: Optional[dict] = None
    jd_text: Optional[str] = None


class UpdateResumeBody(BaseModel):
    label: Optional[str] = None
    resume: Optional[Resume] = None
    template_id: Optional[str] = None
    theme: Optional[dict] = None
    jd_text: Optional[str] = None


@router.get("")
def list_resumes() -> list[ResumeMeta]:
    return storage.list_resumes()


@router.post("", status_code=201)
def create_resume(body: CreateResumeBody) -> ResumeRecord:
    return storage.create_resume(
        label=body.label or "Untitled resume",
        resume=body.resume,
        template_id=body.template_id or "minimal",
        theme=body.theme,
        jd_text=body.jd_text,
    )


@router.get("/{resume_id}/changes", response_model=ResumeDiff)
def get_resume_changes(resume_id: str) -> ResumeDiff:
    """Compare original (pre-upgrade) vs current resume — call after generate."""
    record = storage.get_resume(resume_id)
    if record is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    original = record.original_resume or record.resume
    return compute_resume_diff(original, record.resume)


@router.get("/{resume_id}")
def get_resume(resume_id: str) -> ResumeRecord:
    record = storage.get_resume(resume_id)
    if record is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    return record


@router.put("/{resume_id}")
def update_resume(resume_id: str, body: UpdateResumeBody) -> ResumeRecord:
    record = storage.update_resume(
        resume_id,
        label=body.label,
        resume=body.resume,
        template_id=body.template_id,
        theme=body.theme,
        jd_text=body.jd_text,
    )
    if record is None:
        raise HTTPException(404, f"Resume {resume_id} not found")
    return record


@router.delete("/{resume_id}", status_code=204, response_class=Response)
def delete_resume(resume_id: str):
    ok = storage.delete_resume(resume_id)
    if not ok:
        raise HTTPException(404, f"Resume {resume_id} not found")
    return Response(status_code=204)
