"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

const compactInline = "whitespace-nowrap break-normal";

export function ExperienceBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 flex min-w-0 items-baseline justify-between gap-4">
        <div className="min-w-0 flex-1">
          <EditableText
            path={`experience.${index}.company`}
            mode="inline"
            className={`text-base font-bold ${compactInline}`}
          />
        </div>
        <div className="text-muted-foreground flex shrink-0 items-baseline gap-1 text-sm whitespace-nowrap font-medium">
          <EditableText
            path={`experience.${index}.start`}
            mode="inline"
            className={compactInline}
          />
          <span aria-hidden className="mx-0.5 text-muted-foreground/60">
            –
          </span>
          <EditableText
            path={`experience.${index}.end`}
            mode="inline"
            className={compactInline}
          />
        </div>
      </div>
      <div className="mb-1 flex min-w-0 items-baseline justify-between gap-4 leading-tight">
        <div className="min-w-0 flex-1">
          <EditableText
            path={`experience.${index}.title`}
            mode="inline"
            className={`italic ${compactInline}`}
          />
        </div>
        <EditableText
          path={`experience.${index}.location`}
          mode="inline"
          className={`text-muted-foreground shrink-0 text-right text-sm italic ${compactInline}`}
        />
      </div>
      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
