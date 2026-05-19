"""Build compact resume context for AI section/field rewrites."""

from __future__ import annotations

import re
from typing import Optional

from schemas.resume import Resume


def _strip_html(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"<[^>]+>", " ", text).replace("&nbsp;", " ").strip()


def build_resume_context(
    resume: Resume,
    *,
    jd_text: Optional[str] = None,
    target_role: Optional[str] = None,
    editing_section_type: Optional[str] = None,
    editing_section_title: Optional[str] = None,
) -> str:
    """Narrative snapshot of the candidate for grounded AI edits."""
    lines: list[str] = []

    if resume.name:
        lines.append(f"Name: {resume.name.strip()}")
    if resume.headline:
        lines.append(f"Headline: {_strip_html(resume.headline)}")
    if target_role:
        lines.append(f"Target role: {target_role.strip()}")

    contact = resume.contact
    if contact:
        contact_bits = [
            contact.email,
            contact.phone,
            contact.location,
            contact.linkedin,
            contact.github,
            contact.website,
        ]
        contact_str = ", ".join(c for c in contact_bits if c)
        if contact_str:
            lines.append(f"Contact: {contact_str}")

    if resume.summary and editing_section_type != "summary":
        summary = _strip_html(resume.summary)
        if summary:
            lines.append(f"Summary: {summary[:800]}")

    if resume.experience:
        label = (
            "Experience (for consistency across roles):"
            if editing_section_type == "experience"
            else "Experience:"
        )
        lines.append(label)
        for exp in resume.experience[:8]:
            title = (exp.title or "").strip()
            company = (exp.company or "").strip()
            dates = f"{exp.start or '?'} – {exp.end or 'Present'}"
            lines.append(f"  • {title} at {company} ({dates})")
            for bullet in (exp.bullets or [])[:3]:
                bt = _strip_html(bullet.text)
                if bt:
                    lines.append(f"    - {bt[:200]}")

    if resume.education and editing_section_type != "education":
        lines.append("Education:")
        for edu in resume.education[:5]:
            inst = (edu.institution or "").strip()
            degree = (edu.degree or "").strip()
            field = (edu.field or "").strip()
            line = " — ".join(p for p in [degree, field, inst] if p)
            if line:
                lines.append(f"  • {line}")

    if resume.skills and editing_section_type != "skills":
        lines.append("Skills:")
        for group in resume.skills[:6]:
            cat = (group.category or "").strip()
            items = ", ".join(group.items or [])[:300]
            if cat or items:
                lines.append(f"  • {cat}: {items}" if cat else f"  • {items}")

    if resume.projects and editing_section_type != "projects":
        lines.append("Projects:")
        for proj in (resume.projects or [])[:5]:
            name = (proj.name or "").strip()
            desc = _strip_html(proj.description or "")[:200]
            if name:
                lines.append(f"  • {name}" + (f": {desc}" if desc else ""))

    if resume.certifications and editing_section_type != "certifications":
        certs = [c.strip() for c in (resume.certifications or []) if c and c.strip()]
        if certs:
            lines.append("Certifications: " + "; ".join(certs[:12]))

    if resume.sections:
        for sec in resume.sections:
            if sec.type == "custom" and editing_section_type != "custom":
                title = (sec.title or "Custom").strip()
                body = _strip_html(sec.custom_content or "")[:400]
                if body:
                    lines.append(f"{title}: {body}")

    if editing_section_type:
        lines.append(
            f"\n[Currently editing section: {editing_section_title or editing_section_type}]"
        )

    if jd_text and jd_text.strip():
        lines.append(
            f"\nTarget job description (align wording; do not invent experience):\n"
            f"{jd_text.strip()[:6000]}"
        )

    return "\n".join(lines).strip()
