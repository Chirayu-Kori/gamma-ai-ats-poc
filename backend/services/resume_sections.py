from __future__ import annotations

import re
from html import unescape

from schemas.resume import Resume, ResumeSectionConfig

_CUSTOM_TITLE_KEYWORDS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bpublication", re.I), "Publications"),
    (re.compile(r"\bachievement|\baward|\bhonou?r", re.I), "Achievements"),
    (re.compile(r"\bvolunteer|\bcommunity", re.I), "Volunteer Experience"),
    (re.compile(r"\blanguage", re.I), "Languages"),
    (re.compile(r"\binterest|\bhobby", re.I), "Interests"),
    (re.compile(r"\bactivit", re.I), "Activities"),
    (re.compile(r"\bresearch", re.I), "Research"),
    (re.compile(r"\bpatent", re.I), "Patents"),
    (re.compile(r"\breference", re.I), "References"),
]


def _strip_html(text: str) -> str:
    plain = re.sub(r"<[^>]+>", " ", text or "")
    plain = unescape(plain)
    return re.sub(r"\s+", " ", plain).strip()


def _title_case_words(value: str) -> str:
    return " ".join(word.capitalize() for word in value.split() if word)


def infer_custom_section_title(section: ResumeSectionConfig) -> str:
    existing = (section.title or "").strip()
    if existing and existing.lower() != "custom section":
        return existing

    section_id = (section.id or "").strip()
    if section_id and not section_id.lower().startswith("sec") and len(section_id) <= 40:
        from_id = _title_case_words(section_id.replace("-", " ").replace("_", " "))
        if len(from_id) >= 3:
            return from_id

    plain = _strip_html(section.custom_content or "")
    if not plain:
        return "Additional Information"

    for pattern, title in _CUSTOM_TITLE_KEYWORDS:
        if pattern.search(plain):
            return title

    first_line = re.split(r"[.\n|]", plain, maxsplit=1)[0].strip()
    if 3 <= len(first_line) <= 48:
        return first_line
    if len(first_line) > 48:
        return first_line[:45].rstrip() + "…"
    return "Additional Information"


def normalize_resume_sections(resume: Resume) -> Resume:
    if not resume.sections:
        return resume

    updated: list[ResumeSectionConfig] = []
    for section in resume.sections:
        if section.type == "custom":
            section = section.model_copy(
                update={"title": infer_custom_section_title(section)}
            )
        elif not (section.title or "").strip():
            defaults = {
                "summary": "Summary",
                "experience": "Experience",
                "education": "Education",
                "skills": "Skills",
                "projects": "Projects",
                "certifications": "Certifications",
            }
            section = section.model_copy(
                update={"title": defaults.get(section.type, section.title or "")}
            )
        updated.append(section)

    return resume.model_copy(update={"sections": updated})
