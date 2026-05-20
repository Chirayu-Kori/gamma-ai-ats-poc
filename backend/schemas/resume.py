from __future__ import annotations

import html
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class Bullet(BaseModel):
    text: str = ""
    impact_score: Optional[int] = Field(default=None, ge=1, le=5)
    keywords: list[str] = Field(default_factory=list)
    id: Optional[str] = None


class Experience(BaseModel):
    id: Optional[str] = None
    company: str = ""
    title: str = ""
    start: str = ""
    end: Optional[str] = None
    location: Optional[str] = None
    bullets: list[Bullet] = Field(default_factory=list)


class Education(BaseModel):
    id: Optional[str] = None
    institution: str = ""
    degree: str = ""
    field: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    gpa: Optional[str] = None
    highlights: list[str] = Field(default_factory=list)


class SkillGroup(BaseModel):
    id: Optional[str] = None
    category: str = ""
    items: list[str] = Field(default_factory=list)


class Project(BaseModel):
    id: Optional[str] = None
    name: str = ""
    description: str = ""
    url: Optional[str] = None
    tech_stack: list[str] = Field(default_factory=list)
    bullets: list[Bullet] = Field(default_factory=list)


class ResumeSectionConfig(BaseModel):
    id: str = ""
    type: str = "summary"
    title: str = ""
    visible: bool = True
    order: int = 0
    custom_content: Optional[str] = None


def _normalize_certifications(value: object) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    if isinstance(value, list):
        items = [str(item).strip() for item in value if item and str(item).strip()]
        if not items:
            return None
        li = "".join(f"<li><p>{html.escape(item)}</p></li>" for item in items)
        return f"<ul>{li}</ul>"
    return None


class Resume(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = ""
    headline: str = ""
    contact: ContactInfo = Field(default_factory=ContactInfo)
    contact_order: Optional[list[str]] = Field(default=None, alias="contactOrder")
    summary: str = ""
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    skills: list[SkillGroup] = Field(default_factory=list)
    projects: Optional[list[Project]] = None
    certifications: Optional[str] = None
    sections: Optional[list[ResumeSectionConfig]] = None

    @field_validator("certifications", mode="before")
    @classmethod
    def normalize_certifications(cls, value: object) -> Optional[str]:
        return _normalize_certifications(value)


class ExperienceUpgrade(BaseModel):
    """Rewritten bullets for one job (by index in experience[])."""

    index: int = Field(ge=0)
    bullets: list[Bullet] = Field(default_factory=list)


class ResumeUpgradeDelta(BaseModel):
    """Small patch returned by Gemini — merged into the parsed resume."""

    headline: Optional[str] = None
    summary: Optional[str] = None
    experience: list[ExperienceUpgrade] = Field(default_factory=list)


class ResumeRecord(BaseModel):
    """Wrapper persisted to disk."""

    id: str
    label: str
    resume: Resume
    # Snapshot of the resume as parsed from the user's upload, BEFORE the
    # AI-driven upgrade pass. Used to compute the "what was added / what was
    # missing" diff in the editor sidebar.
    original_resume: Optional[Resume] = None
    theme: dict = Field(default_factory=dict)
    template_id: str = "minimal"
    source_text: Optional[str] = None
    jd_text: Optional[str] = None
    created_at: str
    updated_at: str


class ResumeMeta(BaseModel):
    id: str
    label: str
    template_id: str = "minimal"
    updated_at: str
