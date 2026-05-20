"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { formatDegreeLine, parseDegreeLine } from "@/lib/degree-line";
import { cn } from "@/lib/utils";

import { RichTextField } from "./rich-text-field";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split(".").reduce((acc: any, part) => {
    if (acc === undefined) return undefined;
    return acc[isNaN(Number(part)) ? part : Number(part)];
  }, obj);
}

type EditableDegreeLineProps = {
  index: number;
  className?: string;
  editorClassName?: string;
  placeholder?: string;
};

export function EditableDegreeLine({
  index,
  className,
  editorClassName,
  placeholder = "Degree in Field of Study",
}: EditableDegreeLineProps) {
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const degreePath = `education.${index}.degree`;
  const fieldPath = `education.${index}.field`;
  const degree = getByPath(resume, degreePath);
  const field = getByPath(resume, fieldPath);
  const content = formatDegreeLine(degree, field);

  const applyLine = (html: string) => {
    if (status === "streaming") return;
    const { degree: nextDegree, field: nextField } = parseDegreeLine(html);
    updateField(degreePath, nextDegree);
    updateField(fieldPath, nextField);
    triggerAutosave();
  };

  return (
    <RichTextField
      mode="inline"
      content={content}
      forceSync={status === "streaming"}
      syncContent
      fieldPath={degreePath}
      inlineWrap
      placeholder={placeholder}
      className={cn("resume-entry-degree-line min-w-0 max-w-full", className)}
      editorClassName={cn(
        "whitespace-normal break-words leading-snug py-0",
        editorClassName,
      )}
      onFieldApply={applyLine}
      onUpdate={({ html }) => applyLine(html)}
    />
  );
}
