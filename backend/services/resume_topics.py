"""Derive section headers and topic labels from a parsed resume."""

from __future__ import annotations

from dataclasses import dataclass, field

from schemas.resume import Resume


@dataclass
class UpgradeSection:
    section_id: str
    kind: str  # headline | summary | experience | project
    header: str
    topics: list[str] = field(default_factory=list)
    index: int | None = None
    original_bullets: list[str] = field(default_factory=list)


def _topic_from_bullet(text: str) -> str:
    t = (text or "").strip()
    if not t:
        return ""
    head = t.split(".")[0].split(";")[0].split(",")[0].strip()
    words = head.split()
    if len(words) > 10:
        head = " ".join(words[:10])
    return head[:100]


def _bullets_text(bullets) -> list[str]:
    return [b.text.strip() for b in (bullets or []) if (b.text or "").strip()]


def plan_upgrade_sections(resume: Resume) -> list[UpgradeSection]:
    """Build an ordered upgrade plan driven by the resume's own structure."""

    sections: list[UpgradeSection] = []

    if resume.name or resume.headline:
        sections.append(
            UpgradeSection(
                section_id="headline",
                kind="headline",
                header=resume.headline.strip() or resume.name.strip() or "Professional headline",
                topics=[resume.name] if resume.name else [],
            )
        )

    summary_topics: list[str] = []
    for exp in resume.experience or []:
        for b in _bullets_text(exp.bullets)[:2]:
            topic = _topic_from_bullet(b)
            if topic and topic not in summary_topics:
                summary_topics.append(topic)
    sections.append(
        UpgradeSection(
            section_id="summary",
            kind="summary",
            header="Professional summary",
            topics=summary_topics[:6],
        )
    )

    for i, exp in enumerate(resume.experience or []):
        bullets = _bullets_text(exp.bullets)
        title = (exp.title or "").strip()
        company = (exp.company or "").strip()
        if title and company:
            header = f"{title} — {company}"
        else:
            header = title or company or f"Role {i + 1}"

        topics = [_topic_from_bullet(b) for b in bullets]
        topics = [t for t in topics if t]

        sections.append(
            UpgradeSection(
                section_id=f"experience-{i}",
                kind="experience",
                header=header,
                topics=topics,
                index=i,
                original_bullets=bullets,
            )
        )

    for i, proj in enumerate(resume.projects or []):
        bullets = _bullets_text(proj.bullets)
        name = (proj.name or "").strip() or f"Project {i + 1}"
        desc = (proj.description or "").strip()
        topics = [_topic_from_bullet(b) for b in bullets]
        if desc:
            topics.insert(0, _topic_from_bullet(desc))
        topics = [t for t in topics if t]

        sections.append(
            UpgradeSection(
                section_id=f"project-{i}",
                kind="project",
                header=name,
                topics=topics,
                index=i,
                original_bullets=bullets,
            )
        )

    return sections
