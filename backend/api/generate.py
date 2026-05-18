from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from schemas.resume import Resume
from services import gemini, storage

router = APIRouter(prefix="/api/resumes", tags=["generate"])


class GenerateRequest(BaseModel):
    resume_id: Optional[str] = None
    resume: Optional[Resume] = None
    source_text: Optional[str] = None
    jd_text: Optional[str] = None
    target_role: Optional[str] = None
    instruction: Optional[str] = None


@router.post("/generate")
async def generate_resume_stream(body: GenerateRequest):
    """SSE: stream upgraded Resume JSON deltas.

    Inputs accepted (any combination):
      - resume_id  -> load that record as the base
      - resume     -> base resume passed inline
      - source_text -> raw text from a paste / parse
      - jd_text     -> tailor toward this JD
      - target_role -> optional role hint
      - instruction -> free-form steer ("emphasize leadership")
    """

    base_resume = body.resume
    jd_text = body.jd_text

    if body.resume_id:
        record = storage.get_resume(body.resume_id)
        if record is None:
            raise HTTPException(404, f"Resume {body.resume_id} not found")
        if base_resume is None:
            base_resume = record.resume
        if jd_text is None:
            jd_text = record.jd_text

    async def event_stream():
        async for frame in gemini.stream_resume_to_sse(
            source_text=body.source_text,
            base_resume=base_resume,
            jd_text=jd_text,
            target_role=body.target_role,
            instruction=body.instruction,
        ):
            yield frame

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
