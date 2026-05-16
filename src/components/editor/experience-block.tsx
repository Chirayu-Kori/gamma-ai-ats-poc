"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

export function ExperienceBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-baseline justify-between">
        <EditableText
          path={`experience.${index}.company`}
          mode="inline"
          className="text-base font-bold"
        />
        <div className="text-muted-foreground flex shrink-0 gap-1 text-sm">
          <EditableText path={`experience.${index}.start`} mode="inline" /> -
          <EditableText path={`experience.${index}.end`} mode="inline" />
        </div>
      </div>
      <div className="mb-2 flex items-baseline justify-between">
        <EditableText
          path={`experience.${index}.title`}
          mode="inline"
          className="flex-1 italic"
        />
        <EditableText
          path={`experience.${index}.location`}
          mode="inline"
          className="text-muted-foreground text-right text-sm"
        />
      </div>
      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
