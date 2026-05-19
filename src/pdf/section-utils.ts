import { getVisibleSections } from "@/lib/resume-sections";
import type { Resume, ResumeSectionConfig, ResumeSectionType } from "@/lib/types/resume";

export function getPdfSections(
  resume: Partial<Resume>,
  options?: {
    excludeTypes?: ResumeSectionType[];
    includeTypes?: ResumeSectionType[];
  },
): ResumeSectionConfig[] {
  const visible = getVisibleSections(resume);
  if (options?.includeTypes?.length) {
    const allowed = new Set(options.includeTypes);
    return visible.filter((s) => allowed.has(s.type));
  }
  if (options?.excludeTypes?.length) {
    const excluded = new Set(options.excludeTypes);
    return visible.filter((s) => !excluded.has(s.type));
  }
  return visible;
}

export function findPdfSection(
  resume: Partial<Resume>,
  type: ResumeSectionType,
): ResumeSectionConfig | undefined {
  return getVisibleSections(resume).find((s) => s.type === type);
}
