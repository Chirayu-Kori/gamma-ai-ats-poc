"""Structural diff between original and upgraded resume records."""

from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, Field

from schemas.resume import Resume

ChangeKind = Literal["added", "improved", "missing"]
ChangeArea = Literal[
    "headline",
    "summary",
    "contact",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
]


class ResumeChange(BaseModel):
    id: str
    kind: ChangeKind
    area: ChangeArea
    detail: str


class ResumeDiff(BaseModel):
    added: list[ResumeChange] = Field(default_factory=list)
    improved: list[ResumeChange] = Field(default_factory=list)
    missing: list[ResumeChange] = Field(default_factory=list)


def _norm(s: Optional[str]) -> str:
    if not s:
        return ""
    return re.sub(r"\s+", " ", s).strip()


def _is_empty(v: object) -> bool:
    if v is None:
        return True
    if isinstance(v, str):
        return len(v.strip()) == 0
    if isinstance(v, list):
        return len(v) == 0
    return False


def _scalar_change(
    area: ChangeArea,
    label: str,
    original: Optional[str],
    upgraded: Optional[str],
) -> Optional[ResumeChange]:
    o, u = _norm(original), _norm(upgraded)
    if not o and not u:
        return ResumeChange(
            id=f"miss-{area}",
            kind="missing",
            area=area,
            detail=f"{label} is empty",
        )
    if not o and u:
        return ResumeChange(
            id=f"add-{area}",
            kind="added",
            area=area,
            detail=f"Generated {label.lower()}",
        )
    if o and u and o != u:
        return ResumeChange(
            id=f"imp-{area}",
            kind="improved",
            area=area,
            detail=f"Rewrote {label.lower()} for clarity & impact",
        )
    if o and not u:
        return ResumeChange(
            id=f"miss-{area}",
            kind="missing",
            area=area,
            detail=f"{label} lost in upgrade",
        )
    return None


def _contact_changes(
    original: Optional[Resume],
    upgraded: Optional[Resume],
) -> list[ResumeChange]:
    out: list[ResumeChange] = []
    fields = [
        ("email", "Email"),
        ("phone", "Phone"),
        ("location", "Location"),
        ("linkedin", "LinkedIn"),
        ("github", "GitHub"),
        ("website", "Website"),
    ]
    oc = original.contact if original else None
    uc = upgraded.contact if upgraded else None
    for key, label in fields:
        o = _norm(getattr(oc, key, None) if oc else None)
        u = _norm(getattr(uc, key, None) if uc else None)
        if not o and not u:
            out.append(
                ResumeChange(
                    id=f"miss-contact-{key}",
                    kind="missing",
                    area="contact",
                    detail=f"{label} not found in the original",
                )
            )
        elif not o and u:
            out.append(
                ResumeChange(
                    id=f"add-contact-{key}",
                    kind="added",
                    area="contact",
                    detail=f"Added {label.lower()}",
                )
            )
    return out


def _experience_changes(
    original: Optional[Resume],
    upgraded: Optional[Resume],
) -> list[ResumeChange]:
    out: list[ResumeChange] = []
    orig = (original.experience if original else None) or []
    upg = (upgraded.experience if upgraded else None) or []
    n = max(len(orig), len(upg))
    for i in range(n):
        o = orig[i] if i < len(orig) else None
        u = upg[i] if i < len(upg) else None
        if not o and u:
            out.append(
                ResumeChange(
                    id=f"add-exp-{i}",
                    kind="added",
                    area="experience",
                    detail=f"Added role: {u.title or '(role)'} at {u.company or '(company)'}",
                )
            )
            continue
        if o and not u:
            out.append(
                ResumeChange(
                    id=f"miss-exp-{i}",
                    kind="missing",
                    area="experience",
                    detail=f"Dropped role: {o.title or '(role)'} at {o.company or '(company)'}",
                )
            )
            continue
        if not o or not u:
            continue
        label_for = u.company or u.title or f"Role {i + 1}"
        ob = len(o.bullets or [])
        ub = len(u.bullets or [])
        if ub > ob:
            out.append(
                ResumeChange(
                    id=f"add-exp-bul-{i}",
                    kind="added",
                    area="experience",
                    detail=f"Added {ub - ob} bullet{'s' if ub - ob > 1 else ''} to {label_for}",
                )
            )
        o_texts = {_norm(b.text) for b in (o.bullets or []) if _norm(b.text)}
        u_texts = [_norm(b.text) for b in (u.bullets or []) if _norm(b.text)]
        rewrites = len([t for t in u_texts if t not in o_texts]) - max(ub - ob, 0)
        if rewrites > 0:
            out.append(
                ResumeChange(
                    id=f"imp-exp-{i}",
                    kind="improved",
                    area="experience",
                    detail=f"Rewrote {rewrites} bullet{'s' if rewrites > 1 else ''} for {label_for}",
                )
            )
        if _is_empty(o.location) and not _is_empty(u.location):
            out.append(
                ResumeChange(
                    id=f"add-exp-loc-{i}",
                    kind="added",
                    area="experience",
                    detail=f"Filled in location for {label_for}",
                )
            )
    return out


def compute_resume_diff(
    original: Optional[Resume],
    upgraded: Optional[Resume],
) -> ResumeDiff:
    all_changes: list[ResumeChange] = []

    for area, label, o_val, u_val in (
        (
            "headline",
            "Headline",
            original.headline if original else None,
            upgraded.headline if upgraded else None,
        ),
        (
            "summary",
            "Summary",
            original.summary if original else None,
            upgraded.summary if upgraded else None,
        ),
    ):
        ch = _scalar_change(
            area,  # type: ignore[arg-type]
            label,
            o_val,
            u_val,
        )
        if ch:
            all_changes.append(ch)

    all_changes.extend(_contact_changes(original, upgraded))
    all_changes.extend(_experience_changes(original, upgraded))

    # Education / skills / optional sections — condensed vs TS but same intent
    o_edu = (original.education if original else None) or []
    u_edu = (upgraded.education if upgraded else None) or []
    if len(u_edu) > len(o_edu):
        all_changes.append(
            ResumeChange(
                id="add-edu",
                kind="added",
                area="education",
                detail=f"Added {len(u_edu) - len(o_edu)} education entr{'ies' if len(u_edu) - len(o_edu) > 1 else 'y'}",
            )
        )

    o_sk = (original.skills if original else None) or []
    u_sk = (upgraded.skills if upgraded else None) or []
    o_skill_n = sum(len(g.items or []) for g in o_sk)
    u_skill_n = sum(len(g.items or []) for g in u_sk)
    if u_skill_n > o_skill_n:
        all_changes.append(
            ResumeChange(
                id="add-skill-items",
                kind="added",
                area="skills",
                detail=f"Surfaced {u_skill_n - o_skill_n} additional skill{'s' if u_skill_n - o_skill_n > 1 else ''}",
            )
        )

    return ResumeDiff(
        added=[c for c in all_changes if c.kind == "added"],
        improved=[c for c in all_changes if c.kind == "improved"],
        missing=[c for c in all_changes if c.kind == "missing"],
    )
