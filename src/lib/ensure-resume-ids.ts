import type {
  Bullet,
  Education,
  Experience,
  Project,
  Resume,
} from "./types/resume";

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function ensureBulletIds(bullets: Bullet[] | undefined): Bullet[] {
  return (bullets ?? []).map((b) => ({
    ...b,
    id: b.id ?? createId("bullet"),
  }));
}

function ensureExperienceIds(
  items: Experience[] | undefined,
): Experience[] | undefined {
  if (!items) return items;
  return items.map((exp) => ({
    ...exp,
    id: exp.id ?? createId("exp"),
    bullets: ensureBulletIds(exp.bullets),
  }));
}

function ensureEducationIds(
  items: Education[] | undefined,
): Education[] | undefined {
  if (!items) return items;
  return items.map((edu) => ({
    ...edu,
    id: edu.id ?? createId("edu"),
  }));
}

function ensureProjectIds(items: Project[] | undefined): Project[] | undefined {
  if (!items) return items;
  return items.map((proj) => ({
    ...proj,
    bullets: ensureBulletIds(proj.bullets),
  }));
}

/** Assign stable client-side ids for dnd-kit when missing (parsed/upgraded resumes). */
export function ensureResumeIds<T extends Partial<Resume>>(resume: T): T {
  return {
    ...resume,
    experience: ensureExperienceIds(resume.experience),
    education: ensureEducationIds(resume.education),
    projects: ensureProjectIds(resume.projects ?? undefined),
  };
}
