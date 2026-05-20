"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { formatDateRange, parseDateRange } from "@/lib/date-range";
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

type EditableDateRangeProps = {
  startPath: string;
  endPath: string;
  className?: string;
  editorClassName?: string;
  placeholder?: string;
};

export function EditableDateRange({
  startPath,
  endPath,
  className,
  editorClassName,
  placeholder = "Month YYYY – Present",
}: EditableDateRangeProps) {
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const start = getByPath(resume, startPath);
  const end = getByPath(resume, endPath);
  const content = formatDateRange(start, end);

  const applyRange = (html: string) => {
    if (status === "streaming") return;
    const { start: nextStart, end: nextEnd } = parseDateRange(html);
    updateField(startPath, nextStart);
    updateField(endPath, nextEnd);
    triggerAutosave();
  };

  return (
    <RichTextField
      mode="inline"
      content={content}
      forceSync={status === "streaming"}
      syncContent
      fieldPath={startPath}
      inlineWrap
      placeholder={placeholder}
      className={cn("resume-entry-date-range min-w-0 max-w-[11rem]", className)}
      editorClassName={cn(
        "whitespace-normal break-words text-right leading-tight py-0",
        editorClassName,
      )}
      onFieldApply={applyRange}
      onUpdate={({ html }) => applyRange(html)}
    />
  );
}
