"use client";

import { fieldHasContent } from "@/lib/resume-field-content";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resumeStore";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

const rowHeader =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4";
const rowSubtitle = "flex min-w-0 flex-wrap items-baseline gap-x-3";
const primaryClass = "resume-entry-primary min-w-0 leading-snug";
const metaClass =
  "resume-entry-meta inline-block w-max max-w-none shrink-0 leading-tight";
const dateGroupClass =
  "text-muted-foreground flex shrink-0 items-baseline gap-1 text-sm font-medium leading-tight";

export function ExperienceBlock({ index }: { index: number }) {
  const exp = useResumeStore((s) => s.resume?.experience?.[index]);
  const showSubtitleRow =
    fieldHasContent(exp?.title) || fieldHasContent(exp?.location);

  return (
    <div className="mb-2 min-w-0 space-y-0.5">
      <div className={rowHeader}>
        <EditableText
          path={`experience.${index}.company`}
          mode="inline"
          inlineWrap
          className={cn(primaryClass, "text-base font-bold")}
          editorClassName="whitespace-normal leading-snug py-0"
        />
        <div className={dateGroupClass}>
          <EditableText
            path={`experience.${index}.start`}
            mode="inline"
            className={metaClass}
            editorClassName="whitespace-nowrap py-0 leading-tight"
          />
          <span aria-hidden className="text-muted-foreground/60 shrink-0">
            –
          </span>
          <EditableText
            path={`experience.${index}.end`}
            mode="inline"
            className={metaClass}
            editorClassName="whitespace-nowrap py-0 leading-tight"
          />
        </div>
      </div>

      {showSubtitleRow ? (
        <div className={rowSubtitle}>
          <EditableText
            path={`experience.${index}.title`}
            mode="inline"
            inlineWrap
            className={cn(primaryClass, "text-sm italic")}
            editorClassName="whitespace-normal leading-snug py-0"
          />
          <EditableText
            path={`experience.${index}.location`}
            mode="inline"
            className={cn(
              metaClass,
              "text-muted-foreground text-sm italic",
            )}
            editorClassName="whitespace-nowrap py-0 leading-tight"
          />
        </div>
      ) : null}

      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
