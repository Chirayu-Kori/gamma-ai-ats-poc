"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
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

interface EditableTextProps {
  path: string;
  mode?: "inline" | "block";
  className?: string;
  editorClassName?: string;
  placeholder?: string;
  inlineWrap?: boolean;
  inlineMultiline?: boolean;
}

export function EditableText({
  path,
  mode = "inline",
  className,
  editorClassName,
  placeholder,
  inlineWrap,
  inlineMultiline,
}: EditableTextProps) {
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);
  const value = getByPath(resume, path);
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const content =
    value === undefined || value === null
      ? ""
      : typeof value === "string"
        ? value
        : String(value);

  return (
    <RichTextField
      mode={mode}
      content={content}
      forceSync={status === "streaming"}
      syncContent
      fieldPath={path}
      className={className}
      editorClassName={editorClassName ?? className}
      inlineWrap={inlineWrap}
      inlineMultiline={inlineMultiline}
      placeholder={placeholder}
      onFieldApply={(html) => {
        if (status === "streaming") return;
        updateField(path, html);
        triggerAutosave();
      }}
      onUpdate={({ html }) => {
        if (status === "streaming") return;
        updateField(path, html);
        triggerAutosave();
      }}
    />
  );
}
