"use client";

import { findSectionIndex } from "@/lib/resume-sections";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "./EditableText";
import { SortableExperienceList } from "./sortable-experience-list";
import { SortableEducationList } from "./sortable-education-list";
import { SortableSkillsList } from "./sortable-skills-list";
import { ProjectsList } from "./projects-list";
import { CertificationsList } from "./certifications-list";
import type { ResumeSectionConfig } from "@/lib/types/resume";

type ResumeSectionContentProps = {
  section: ResumeSectionConfig;
};

export function ResumeSectionContent({ section }: ResumeSectionContentProps) {
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
      return <SortableSkillsList />;
    case "projects":
      return <ProjectsList />;
    case "certifications":
      return <CertificationsList />;
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
