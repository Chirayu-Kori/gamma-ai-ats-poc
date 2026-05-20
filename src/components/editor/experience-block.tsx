"use client";

import { fieldHasContent } from "@/lib/resume-field-content";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resumeStore";

import { EditableText } from "./EditableText";
import { EditableDateRange } from "./editable-date-range";
import { BulletList } from "./BulletList";

const rowHeader =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,11rem)] items-baseline gap-x-4";
const rowSubtitle =
  "resume-entry-subtitle-row flex min-w-0 items-baseline justify-between gap-x-4";
const primaryClass = "resume-entry-primary min-w-0 leading-snug";
const subtitleTitleClass = cn(primaryClass, "min-w-0 flex-1 text-sm italic");
const subtitleLocationClass =
  "resume-entry-meta text-muted-foreground min-w-0 max-w-[45%] shrink-0 text-right text-sm italic leading-tight";
const dateRangeClass =
  "text-muted-foreground resume-entry-meta min-w-0 text-sm font-medium leading-tight";

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
        <EditableDateRange
          startPath={`experience.${index}.start`}
          endPath={`experience.${index}.end`}
          className={dateRangeClass}
          placeholder="Month YYYY – Present"
        />
      </div>

      {showSubtitleRow ? (
        <div className={rowSubtitle}>
          <EditableText
            path={`experience.${index}.title`}
            mode="inline"
            inlineWrap
            className={subtitleTitleClass}
            editorClassName="whitespace-normal leading-snug py-0"
          />
          <EditableText
            path={`experience.${index}.location`}
            mode="inline"
            inlineWrap
            className={subtitleLocationClass}
            editorClassName="whitespace-normal break-words text-right leading-tight py-0"
          />
        </div>
      ) : null}

      <BulletList expIdx={index} section="experience" />
    </div>
  );
}
