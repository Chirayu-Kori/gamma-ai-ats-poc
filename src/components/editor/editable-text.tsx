"use client";

import { RichTextField } from "./rich-text-field";

export function EditableInline({
  initialContent,
  className,
}: {
  initialContent: string;
  className?: string;
}) {
  return (
    <RichTextField
      mode="inline"
      content={initialContent}
      className={className}
      syncContent={false}
    />
  );
}

export function EditableBlock({
  initialContent,
  className,
}: {
  initialContent: string;
  className?: string;
}) {
  return (
    <RichTextField
      mode="block"
      content={initialContent}
      className={className}
      syncContent={false}
    />
  );
}
