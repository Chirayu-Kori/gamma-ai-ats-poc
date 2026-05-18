from __future__ import annotations

import logging
import traceback
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from schemas.resume import Resume
from services import gemini, storage

log = logging.getLogger("parse")

router = APIRouter(prefix="/api/resumes", tags=["parse"])

ALLOWED_MIME = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB


@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...),
    jd_text: Optional[str] = Form(default=None),
    label: Optional[str] = Form(default=None),
):
    """Upload resume (+ optional JD). Returns parsed Resume JSON and a draft id."""

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File exceeds 8 MB limit")
    mime = file.content_type or ""
    if mime not in ALLOWED_MIME:
        raise HTTPException(415, f"Unsupported file type: {mime or 'unknown'}")

    try:
        parsed: Resume = gemini.parse_resume_file(
            data, mime_type=mime, jd_text=jd_text
        )
    except Exception as exc:
        tb = traceback.format_exc()
        log.error("Parse failed:\n%s", tb)
        raise HTTPException(
            status_code=502,
            detail={"message": str(exc), "trace": tb.splitlines()[-6:]},
        ) from exc

    # Persist a draft record so we can revisit
    record_label = (
        label
        or parsed.name
        or (file.filename or "Untitled resume")
    )
    record = storage.create_resume(
        label=record_label,
        resume=parsed,
        source_text=None,
        jd_text=jd_text,
    )

    return {
        "id": record.id,
        "label": record.label,
        "resume": parsed.model_dump(),
        "jd_text": jd_text,
    }
