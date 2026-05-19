"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { findSectionIndex } from "@/lib/resume-sections";
import { RichTextField } from "./rich-text-field";
import { cn } from "@/lib/utils";

type EditableSectionTitleProps = {
  sectionId: string;
  className?: string;
  as?: "h2" | "h3" | "div";
};

export function EditableSectionTitle({
  sectionId,
  className,
  as: Tag = "h2",
}: EditableSectionTitleProps) {
  const resume = useResumeStore((s) => s.resume);
  const updateSectionTitle = useResumeStore((s) => s.updateSectionTitle);
  const triggerAutosave = useDebouncedAutosave();

  const index = findSectionIndex(resume, sectionId);
  const section = index >= 0 ? resume?.sections?.[index] : undefined;
  if (!section) return null;

  return (
    <Tag className={cn("resume-section-title min-w-0 max-w-full", className)}>
      <RichTextField
        mode="inline"
        inlineWrap
        content={section.title}
        className="min-w-0 max-w-full"
        editorClassName="min-w-0 max-w-full"
        placeholder="Section title"
        onUpdate={({ text }) => {
          updateSectionTitle(sectionId, text);
          triggerAutosave();
        }}
      />
    </Tag>
  );
}
