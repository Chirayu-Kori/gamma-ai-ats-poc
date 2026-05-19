from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


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
    category: str = ""
    items: list[str] = Field(default_factory=list)


class Project(BaseModel):
    name: str = ""
    description: str = ""
    url: Optional[str] = None
    tech_stack: list[str] = Field(default_factory=list)
    bullets: list[Bullet] = Field(default_factory=list)


class Resume(BaseModel):
    name: str = ""
    headline: str = ""
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    skills: list[SkillGroup] = Field(default_factory=list)
    projects: Optional[list[Project]] = None
    certifications: Optional[list[str]] = None


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
