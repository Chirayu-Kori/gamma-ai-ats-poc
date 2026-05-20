import type { Resume } from "@/lib/types/resume";
import { certificationsPlainText } from "@/lib/certifications-content";

export type ChangeKind = "added" | "improved" | "missing";

export type ResumeChange = {
  id: string;
  kind: ChangeKind;
  area:
    | "headline"
    | "summary"
    | "contact"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications";
  detail: string;
};

export type ResumeDiff = {
  added: ResumeChange[];
  improved: ResumeChange[];
  missing: ResumeChange[];
};

const isEmpty = (v: unknown): boolean => {
  if (v == null) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
};

const norm = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

function scalarChange(
  area: ResumeChange["area"],
  label: string,
  original?: string | null,
  upgraded?: string | null,
): ResumeChange | null {
  const o = norm(original);
  const u = norm(upgraded);
  if (!o && !u) {
    return {
      id: `miss-${area}`,
      kind: "missing",
      area,
      detail: `${label} is empty`,
    };
  }
  if (!o && u) {
    return {
      id: `add-${area}`,
      kind: "added",
      area,
      detail: `Generated ${label.toLowerCase()}`,
    };
  }
  if (o && u && o !== u) {
    return {
      id: `imp-${area}`,
      kind: "improved",
      area,
      detail: `Rewrote ${label.toLowerCase()} for clarity & impact`,
    };
  }
  if (o && !u) {
    return {
      id: `miss-${area}`,
      kind: "missing",
      area,
      detail: `${label} lost in upgrade`,
    };
  }
  return null;
}

function contactChanges(
  original: Resume["contact"] | undefined,
  upgraded: Resume["contact"] | undefined,
): ResumeChange[] {
  const out: ResumeChange[] = [];
  const fields: Array<{ key: keyof Resume["contact"]; label: string }> = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "github", label: "GitHub" },
    { key: "website", label: "Website" },
  ];
  for (const { key, label } of fields) {
    const o = norm(original?.[key]);
    const u = norm(upgraded?.[key]);
    if (!o && !u) {
      out.push({
        id: `miss-contact-${String(key)}`,
        kind: "missing",
        area: "contact",
        detail: `${label} not found in the original`,
      });
    } else if (!o && u) {
      out.push({
        id: `add-contact-${String(key)}`,
        kind: "added",
        area: "contact",
        detail: `Added ${label.toLowerCase()}`,
      });
    }
  }
  return out;
}

function experienceChanges(
  original: Resume["experience"] | undefined,
  upgraded: Resume["experience"] | undefined,
): ResumeChange[] {
  const out: ResumeChange[] = [];
  const orig = original ?? [];
  const upg = upgraded ?? [];

  const n = Math.max(orig.length, upg.length);
  for (let i = 0; i < n; i++) {
    const o = orig[i];
    const u = upg[i];
    if (!o && u) {
      out.push({
        id: `add-exp-${i}`,
        kind: "added",
        area: "experience",
        detail: `Added role: ${u.title || "(role)"} at ${u.company || "(company)"}`,
      });
      continue;
    }
    if (o && !u) {
      out.push({
        id: `miss-exp-${i}`,
        kind: "missing",
        area: "experience",
        detail: `Dropped role: ${o.title || "(role)"} at ${o.company || "(company)"}`,
      });
      continue;
    }
    if (!o || !u) continue;

    const labelFor = u.company || u.title || `Role ${i + 1}`;
    const ob = o.bullets?.length ?? 0;
    const ub = u.bullets?.length ?? 0;
    if (ub > ob) {
      out.push({
        id: `add-exp-bul-${i}`,
        kind: "added",
        area: "experience",
        detail: `Added ${ub - ob} bullet${ub - ob > 1 ? "s" : ""} to ${labelFor}`,
      });
    }

    const oTexts = new Set(
      (o.bullets ?? []).map((b) => norm(b.text)).filter(Boolean),
    );
    const uTexts = (u.bullets ?? []).map((b) => norm(b.text)).filter(Boolean);
    const rewrites =
      uTexts.filter((t) => !oTexts.has(t)).length - Math.max(ub - ob, 0);
    if (rewrites > 0) {
      out.push({
        id: `imp-exp-${i}`,
        kind: "improved",
        area: "experience",
        detail: `Rewrote ${rewrites} bullet${rewrites > 1 ? "s" : ""} for ${labelFor}`,
      });
    }

    if (isEmpty(o.location) && !isEmpty(u.location)) {
      out.push({
        id: `add-exp-loc-${i}`,
        kind: "added",
        area: "experience",
        detail: `Filled in location for ${labelFor}`,
      });
    }
  }
  return out;
}

function educationChanges(
  original: Resume["education"] | undefined,
  upgraded: Resume["education"] | undefined,
): ResumeChange[] {
  const out: ResumeChange[] = [];
  const orig = original ?? [];
  const upg = upgraded ?? [];
  const oCount = orig.length;
  const uCount = upg.length;
  if (uCount > oCount) {
    out.push({
      id: "add-edu",
      kind: "added",
      area: "education",
      detail: `Added ${uCount - oCount} education entr${uCount - oCount > 1 ? "ies" : "y"}`,
    });
  }
  upg.forEach((u, i) => {
    const o = orig[i];
    if (!o) return;
    if (isEmpty(o.field) && !isEmpty(u.field)) {
      out.push({
        id: `add-edu-field-${i}`,
        kind: "added",
        area: "education",
        detail: `Filled in field of study for ${u.institution || "education entry"}`,
      });
    }
    if (isEmpty(o.highlights) && !isEmpty(u.highlights)) {
      out.push({
        id: `add-edu-hl-${i}`,
        kind: "added",
        area: "education",
        detail: `Added highlights for ${u.institution || "education entry"}`,
      });
    }
  });
  if (oCount === 0 && uCount === 0) {
    out.push({
      id: "miss-edu",
      kind: "missing",
      area: "education",
      detail: "No education entries",
    });
  }
  return out;
}

function skillsChanges(
  original: Resume["skills"] | undefined,
  upgraded: Resume["skills"] | undefined,
): ResumeChange[] {
  const out: ResumeChange[] = [];
  const oGroups = original ?? [];
  const uGroups = upgraded ?? [];
  if (uGroups.length > oGroups.length) {
    out.push({
      id: "add-skill-cats",
      kind: "added",
      area: "skills",
      detail: `Added ${uGroups.length - oGroups.length} skill categor${
        uGroups.length - oGroups.length > 1 ? "ies" : "y"
      }`,
    });
  }
  const oCount = oGroups.reduce((acc, g) => acc + (g.items?.length ?? 0), 0);
  const uCount = uGroups.reduce((acc, g) => acc + (g.items?.length ?? 0), 0);
  if (uCount > oCount) {
    out.push({
      id: "add-skill-items",
      kind: "added",
      area: "skills",
      detail: `Surfaced ${uCount - oCount} additional skill${uCount - oCount > 1 ? "s" : ""}`,
    });
  }
  if (oCount === 0 && uCount === 0) {
    out.push({
      id: "miss-skills",
      kind: "missing",
      area: "skills",
      detail: "No skills detected",
    });
  }
  return out;
}

function optionalSectionChange(
  area: "projects" | "certifications",
  label: string,
  original: unknown[] | null | undefined,
  upgraded: unknown[] | null | undefined,
): ResumeChange | null {
  const o = original?.length ?? 0;
  const u = upgraded?.length ?? 0;
  if (o === 0 && u > 0) {
    return {
      id: `add-${area}`,
      kind: "added",
      area,
      detail: `Added ${u} ${label.toLowerCase()}`,
    };
  }
  if (o === 0 && u === 0) {
    return {
      id: `miss-${area}`,
      kind: "missing",
      area,
      detail: `No ${label.toLowerCase()} listed`,
    };
  }
  return null;
}

export function computeResumeDiff(
  original: Partial<Resume> | null | undefined,
  upgraded: Partial<Resume> | null | undefined,
): ResumeDiff {
  const all: ResumeChange[] = [];

  const headline = scalarChange(
    "headline",
    "Headline",
    original?.headline,
    upgraded?.headline,
  );
  if (headline) all.push(headline);

  const summary = scalarChange(
    "summary",
    "Summary",
    original?.summary,
    upgraded?.summary,
  );
  if (summary) all.push(summary);

  all.push(
    ...contactChanges(
      original?.contact as Resume["contact"],
      upgraded?.contact as Resume["contact"],
    ),
  );
  all.push(
    ...experienceChanges(
      original?.experience as Resume["experience"],
      upgraded?.experience as Resume["experience"],
    ),
  );
  all.push(
    ...educationChanges(
      original?.education as Resume["education"],
      upgraded?.education as Resume["education"],
    ),
  );
  all.push(
    ...skillsChanges(
      original?.skills as Resume["skills"],
      upgraded?.skills as Resume["skills"],
    ),
  );

  const projects = optionalSectionChange(
    "projects",
    "Projects",
    original?.projects ?? undefined,
    upgraded?.projects ?? undefined,
  );
  if (projects) all.push(projects);

  const certs = scalarChange(
    "certifications",
    "Certifications",
    certificationsPlainText(original?.certifications),
    certificationsPlainText(upgraded?.certifications),
  );
  if (certs) all.push(certs);

  return {
    added: all.filter((c) => c.kind === "added"),
    improved: all.filter((c) => c.kind === "improved"),
    missing: all.filter((c) => c.kind === "missing"),
  };
}
