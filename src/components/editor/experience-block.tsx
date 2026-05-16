"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

export function ExperienceBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <EditableText
          path={`experience.${index}.company`}
          mode="inline"
          className="min-w-0 text-base font-bold"
        />
        <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm whitespace-nowrap">
          <EditableText path={`experience.${index}.start`} mode="inline" />
          <span>-</span>
          <EditableText path={`experience.${index}.end`} mode="inline" />
        </div>
      </div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <EditableText
          path={`experience.${index}.title`}
          mode="inline"
          className="min-w-0 flex-1 italic"
        />
        <EditableText
          path={`experience.${index}.location`}
          mode="inline"
          className="text-muted-foreground shrink-0 text-right text-sm"
        />
      </div>
      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
