"use client";

import { findSectionIndex } from "@/lib/resume-sections";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "./EditableText";
import { SortableExperienceList } from "./sortable-experience-list";
import { SortableEducationList } from "./sortable-education-list";
import { SortableSkillsList } from "./sortable-skills-list";
import type { SkillsRowVariant } from "./skills-row";
import { ProjectsList } from "./projects-list";
import type { ResumeSectionConfig } from "@/lib/types/resume";

type ResumeSectionContentProps = {
  section: ResumeSectionConfig;
  /** `stacked` for narrow sidebars; `pills` for Creative template only. */
  skillsVariant?: SkillsRowVariant;
};

export function ResumeSectionContent({
  section,
  skillsVariant,
}: ResumeSectionContentProps) {
  const resume = useResumeStore((s) => s.resume);
  const sectionIndex = findSectionIndex(resume, section.id);

  switch (section.type) {
    case "summary":
      return (
        <EditableText
          path="summary"
          mode="block"
          className="text-sm leading-relaxed"
          placeholder="Write a professional summary..."
        />
      );
    case "experience":
      return <SortableExperienceList />;
    case "education":
      return <SortableEducationList />;
    case "skills":
      return <SortableSkillsList variant={skillsVariant} />;
    case "projects":
      return <ProjectsList />;
    case "certifications":
      return (
        <EditableText
          path="certifications"
          mode="block"
          className="text-sm leading-relaxed"
          placeholder="List certifications, licenses, or credentials..."
        />
      );
    case "custom":
      if (sectionIndex < 0) return null;
      return (
        <EditableText
          path={`sections.${sectionIndex}.custom_content`}
          mode="block"
          className="text-sm leading-relaxed"
          placeholder="Add custom section content..."
        />
      );
    default:
      return null;
  }
}
