"use client";

import { EditableText } from "./EditableText";

export function EducationBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-baseline justify-between">
        <EditableText
          path={`education.${index}.institution`}
          mode="inline"
          className="text-base font-bold"
        />
        <div className="text-muted-foreground flex shrink-0 gap-1 text-sm">
          <EditableText path={`education.${index}.start`} mode="inline" /> -
          <EditableText path={`education.${index}.end`} mode="inline" />
        </div>
      </div>
      <div className="mb-1">
        <EditableText
          path={`education.${index}.degree`}
          mode="inline"
          className="inline italic"
        />
        {" in "}
        <EditableText
          path={`education.${index}.field`}
          mode="inline"
          className="inline"
        />
      </div>
    </div>
  );
}
