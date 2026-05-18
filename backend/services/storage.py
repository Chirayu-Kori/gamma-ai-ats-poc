"""JSON-in-txt-file storage for resume records.

Layout:
  data/
    resumes/
      {id}.txt        # JSON-serialized ResumeRecord
    uploads/
      {upload_id}.bin # raw bytes of uploaded resume/jd files
"""

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from schemas.resume import Resume, ResumeMeta, ResumeRecord

DATA_DIR = Path(os.getenv("DATA_DIR", "./data")).resolve()
RESUMES_DIR = DATA_DIR / "resumes"
UPLOADS_DIR = DATA_DIR / "uploads"

RESUMES_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


_SAFE_ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def _ensure_safe_id(resume_id: str) -> None:
    if not _SAFE_ID.match(resume_id):
        raise ValueError(f"Invalid resume id: {resume_id}")


def _resume_path(resume_id: str) -> Path:
    _ensure_safe_id(resume_id)
    return RESUMES_DIR / f"{resume_id}.txt"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_resume_id() -> str:
    return f"r-{uuid.uuid4().hex[:12]}"


def save_upload(data: bytes, suffix: str = "bin") -> Path:
    upload_id = uuid.uuid4().hex
    path = UPLOADS_DIR / f"{upload_id}.{suffix.lstrip('.')}"
    path.write_bytes(data)
    return path


def create_resume(
    label: str,
    resume: Optional[Resume] = None,
    template_id: str = "minimal",
    theme: Optional[dict] = None,
    source_text: Optional[str] = None,
    jd_text: Optional[str] = None,
    resume_id: Optional[str] = None,
    original_resume: Optional[Resume] = None,
) -> ResumeRecord:
    rid = resume_id or new_resume_id()
    _ensure_safe_id(rid)
    now = _now_iso()
    seeded = resume or Resume()
    record = ResumeRecord(
        id=rid,
        label=label or "Untitled resume",
        resume=seeded,
        # If caller didn't pass an explicit original, snapshot the seed resume.
        # That way "parse" calls (which only have one version) still get a
        # baseline for diffing once the upgrade pass runs.
        original_resume=original_resume if original_resume is not None else seeded.model_copy(deep=True),
        template_id=template_id,
        theme=theme or {},
        source_text=source_text,
        jd_text=jd_text,
        created_at=now,
        updated_at=now,
    )
    _write_record(record)
    return record


def _write_record(record: ResumeRecord) -> None:
    path = _resume_path(record.id)
    path.write_text(record.model_dump_json(indent=2), encoding="utf-8")


def get_resume(resume_id: str) -> Optional[ResumeRecord]:
    path = _resume_path(resume_id)
    if not path.exists():
        return None
    raw = path.read_text(encoding="utf-8")
    return ResumeRecord.model_validate_json(raw)


def update_resume(
    resume_id: str,
    *,
    label: Optional[str] = None,
    resume: Optional[Resume] = None,
    template_id: Optional[str] = None,
    theme: Optional[dict] = None,
    jd_text: Optional[str] = None,
) -> Optional[ResumeRecord]:
    record = get_resume(resume_id)
    if record is None:
        return None
    if label is not None:
        record.label = label
    if resume is not None:
        record.resume = resume
    if template_id is not None:
        record.template_id = template_id
    if theme is not None:
        record.theme = theme
    if jd_text is not None:
        record.jd_text = jd_text
    record.updated_at = _now_iso()
    _write_record(record)
    return record


def delete_resume(resume_id: str) -> bool:
    path = _resume_path(resume_id)
    if not path.exists():
        return False
    path.unlink()
    return True


def list_resumes() -> list[ResumeMeta]:
    records: list[ResumeMeta] = []
    for path in RESUMES_DIR.glob("*.txt"):
        try:
            rec = ResumeRecord.model_validate_json(path.read_text(encoding="utf-8"))
            records.append(
                ResumeMeta(
                    id=rec.id,
                    label=rec.label,
                    template_id=rec.template_id,
                    updated_at=rec.updated_at,
                )
            )
        except Exception:
            continue
    records.sort(key=lambda r: r.updated_at, reverse=True)
    return records
