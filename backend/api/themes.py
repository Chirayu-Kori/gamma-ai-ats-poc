from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import gemini

router = APIRouter(prefix="/api/themes", tags=["themes"])


class ThemeRequest(BaseModel):
    prompt: str


@router.post("/generate")
def generate_theme(body: ThemeRequest) -> dict:
    if not body.prompt.strip():
        raise HTTPException(400, "Prompt is required")
    try:
        return gemini.generate_theme(body.prompt)
    except Exception as exc:
        raise HTTPException(502, f"Theme generation failed: {exc}") from exc
