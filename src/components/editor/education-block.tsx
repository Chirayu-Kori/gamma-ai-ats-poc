"use client";

import { cn } from "@/lib/utils";
import { fieldHasContent } from "@/lib/resume-field-content";
import { shouldShowFieldInDegreeLine } from "@/lib/degree-line";
import { useResumeStore } from "@/stores/resumeStore";

import { EditableText } from "./EditableText";
import { EditableDegreeLine } from "./editable-degree-line";

const rowBetween =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4";
const primaryClass = "resume-entry-primary min-w-0 leading-snug";
const metaClass =
  "resume-entry-meta inline-block w-max max-w-none shrink-0 leading-tight";
const dateGroupClass =
  "text-muted-foreground flex shrink-0 items-baseline gap-1 text-sm font-medium leading-tight";

function EducationDates({ index }: { index: number }) {
  const edu = useResumeStore((s) => s.resume?.education?.[index]);
  const hasStart = fieldHasContent(edu?.start);
  const hasEnd = fieldHasContent(edu?.end);

  return (
    <div className={dateGroupClass}>
      {hasStart ? (
        <>
          <EditableText
            path={`education.${index}.start`}
            mode="inline"
            className={metaClass}
            editorClassName="whitespace-nowrap py-0 leading-tight"
          />
          {hasEnd ? (
            <span aria-hidden className="text-muted-foreground/60 shrink-0">
              –
            </span>
          ) : null}
        </>
      ) : null}
      {hasEnd || !hasStart ? (
        <EditableText
          path={`education.${index}.end`}
          mode="inline"
          className={metaClass}
          editorClassName="whitespace-nowrap py-0 leading-tight"
          placeholder={!hasEnd && !hasStart ? "Graduation date" : undefined}
        />
      ) : null}
    </div>
  );
}

export function EducationBlock({ index }: { index: number }) {
  const edu = useResumeStore((s) => s.resume?.education?.[index]);
  const degreePlain = (edu?.degree ?? "").replace(/<[^>]+>/g, "").trim();
  const showField = shouldShowFieldInDegreeLine(degreePlain, edu?.field);
  const highlights = edu?.highlights?.filter(Boolean) ?? [];

  const showDegreeRow =
    fieldHasContent(edu?.degree) ||
    (showField && fieldHasContent(edu?.field)) ||
    fieldHasContent(edu?.gpa);

  return (
    <div className="mb-2 min-w-0 space-y-1.5">
      <div className={rowBetween}>
        <EditableText
          path={`education.${index}.institution`}
          mode="inline"
          inlineWrap
          className={cn(primaryClass, "text-base font-bold")}
          editorClassName="whitespace-normal leading-snug py-0"
        />
        <EducationDates index={index} />
      </div>

      {showDegreeRow ? (
        <div className={rowBetween}>
          <EditableDegreeLine
            index={index}
            className={cn(
              primaryClass,
              "text-muted-foreground text-sm italic",
            )}
          />
          {fieldHasContent(edu?.gpa) ? (
            <EditableText
              path={`education.${index}.gpa`}
              mode="inline"
              className={cn(
                metaClass,
                "text-muted-foreground justify-self-end text-right text-sm",
              )}
              editorClassName="whitespace-nowrap py-0 leading-tight"
            />
          ) : null}
        </div>
      ) : null}

      {highlights.length > 0 ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
          {highlights.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
