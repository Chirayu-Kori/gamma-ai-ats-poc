"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

export function ExperienceBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0 flex-1">
          <EditableText
            path={`experience.${index}.company`}
            mode="inline"
            inlineWrap
            className="text-base font-bold"
          />
        </div>
        <div className="text-muted-foreground flex min-w-0 shrink-0 flex-wrap items-baseline gap-1 text-sm font-medium">
          <EditableText
            path={`experience.${index}.start`}
            mode="inline"
            inlineWrap
            className="min-w-0"
          />
          <span aria-hidden className="text-muted-foreground/60">
            –
          </span>
          <EditableText
            path={`experience.${index}.end`}
            mode="inline"
            inlineWrap
            className="min-w-0"
          />
        </div>
      </div>
      <div className="mb-1 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 leading-tight">
        <div className="min-w-0 flex-1">
          <EditableText
            path={`experience.${index}.title`}
            mode="inline"
            inlineWrap
            className="italic"
          />
        </div>
        <EditableText
          path={`experience.${index}.location`}
          mode="inline"
          inlineWrap
          className="text-muted-foreground min-w-0 text-right text-sm italic"
        />
      </div>
      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
