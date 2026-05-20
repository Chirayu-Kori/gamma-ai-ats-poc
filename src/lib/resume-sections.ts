import { createId } from "./ensure-resume-ids";
import { hasCertificationsContent } from "./certifications-content";
import type {
  Resume,
  ResumeSectionConfig,
  ResumeSectionType,
} from "./types/resume";

export const DEFAULT_SECTION_TITLES: Record<ResumeSectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  custom: "Additional Information",
};

const CUSTOM_TITLE_KEYWORDS: { pattern: RegExp; title: string }[] = [
  { pattern: /\bpublication/i, title: "Publications" },
  { pattern: /\bachievement|\baward|\bhonou?r/i, title: "Achievements" },
  { pattern: /\bvolunteer|\bcommunity/i, title: "Volunteer Experience" },
  { pattern: /\blanguage/i, title: "Languages" },
  { pattern: /\binterest|\bhobby/i, title: "Interests" },
  { pattern: /\bactivit/i, title: "Activities" },
  { pattern: /\bresearch/i, title: "Research" },
  { pattern: /\bpatent/i, title: "Patents" },
  { pattern: /\breference/i, title: "References" },
];

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Derive a human section title from AI parse output or content. */
export function inferCustomSectionTitle(section: ResumeSectionConfig): string {
  const existing = section.title?.trim();
  if (existing && !/^custom section$/i.test(existing)) {
    return existing;
  }

  const id = section.id?.trim() ?? "";
  if (id && !/^sec[-_]/i.test(id) && id.length <= 40) {
    const fromId = titleCaseWords(id.replace(/[-_]+/g, " "));
    if (fromId.length >= 3 && !/^Sec\b/.test(fromId)) {
      return fromId;
    }
  }

  const plain = stripHtml(section.custom_content ?? "");
  if (!plain) return DEFAULT_SECTION_TITLES.custom;

  for (const { pattern, title } of CUSTOM_TITLE_KEYWORDS) {
    if (pattern.test(plain)) return title;
  }

  const firstLine = plain.split(/[.\n|]/)[0]?.trim() ?? "";
  if (firstLine.length >= 3 && firstLine.length <= 48) {
    return firstLine;
  }

  return firstLine.length > 48
    ? `${firstLine.slice(0, 45).trim()}…`
    : DEFAULT_SECTION_TITLES.custom;
}

export const SECTION_TYPE_OPTIONS: {
  type: ResumeSectionType;
  label: string;
}[] = [
  { type: "summary", label: "Summary" },
  { type: "experience", label: "Experience" },
  { type: "education", label: "Education" },
  { type: "skills", label: "Skills" },
  { type: "projects", label: "Projects" },
  { type: "certifications", label: "Certifications" },
  { type: "custom", label: "Custom section" },
];

const INFER_ORDER: ResumeSectionType[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

export function hasSectionContent(
  resume: Partial<Resume>,
  type: ResumeSectionType,
): boolean {
  switch (type) {
    case "summary":
      return Boolean(resume.summary?.trim());
    case "experience":
      return (resume.experience?.length ?? 0) > 0;
    case "education":
      return (resume.education?.length ?? 0) > 0;
    case "skills":
      return (resume.skills?.length ?? 0) > 0;
    case "projects":
      return (resume.projects?.length ?? 0) > 0;
    case "certifications":
      return hasCertificationsContent(resume.certifications);
    case "custom":
      return false;
    default:
      return false;
  }
}

export function inferSectionsFromResume(
  resume: Partial<Resume>,
): ResumeSectionConfig[] {
  const sections: ResumeSectionConfig[] = [];
  let order = 0;

  for (const type of INFER_ORDER) {
    if (!hasSectionContent(resume, type)) continue;
    sections.push({
      id: createId("sec"),
      type,
      title: DEFAULT_SECTION_TITLES[type],
      visible: true,
      order: order++,
    });
  }

  const customSections =
    resume.sections?.filter((section) => section.type === "custom") ?? [];
  for (const section of customSections) {
    sections.push({
      ...section,
      title: inferCustomSectionTitle(section),
      order: order++,
    });
  }

  return sections;
}

export function ensureResumeSections<T extends Partial<Resume>>(resume: T): T {
  const existing = resume.sections;
  if (!existing?.length) {
    return { ...resume, sections: inferSectionsFromResume(resume) };
  }

  const merged = existing.map((section, index) => ({
    ...section,
    order: section.order ?? index,
    visible: section.visible ?? true,
    title:
      section.type === "custom"
        ? inferCustomSectionTitle(section)
        : section.title?.trim()
          ? section.title
          : DEFAULT_SECTION_TITLES[section.type],
  }));

  const presentTypes = new Set(
    merged.filter((section) => section.type !== "custom").map((s) => s.type),
  );

  let nextOrder = Math.max(-1, ...merged.map((section) => section.order)) + 1;

  for (const type of INFER_ORDER) {
    if (presentTypes.has(type)) continue;
    if (!hasSectionContent(resume, type)) continue;
    merged.push({
      id: createId("sec"),
      type,
      title: DEFAULT_SECTION_TITLES[type],
      visible: true,
      order: nextOrder++,
    });
  }

  merged.sort((a, b) => a.order - b.order);
  merged.forEach((section, index) => {
    section.order = index;
  });

  return { ...resume, sections: merged };
}

export function getVisibleSections(resume: Partial<Resume> | null | undefined) {
  return (resume?.sections ?? [])
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);
}

export function getSectionTitle(
  resume: Partial<Resume> | null | undefined,
  type: ResumeSectionType,
  fallback = DEFAULT_SECTION_TITLES[type],
) {
  return resume?.sections?.find((section) => section.type === type)?.title ?? fallback;
}

export function findSectionIndex(
  resume: Partial<Resume> | null | undefined,
  sectionId: string,
) {
  return resume?.sections?.findIndex((section) => section.id === sectionId) ?? -1;
}
