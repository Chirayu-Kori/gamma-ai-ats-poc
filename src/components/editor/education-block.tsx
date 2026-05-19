"use client";

import { cn } from "@/lib/utils";
import { fieldHasContent } from "@/lib/resume-field-content";
import { useResumeStore } from "@/stores/resumeStore";

import { EditableText } from "./EditableText";

const rowBetween =
  "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4";
const primaryClass = "resume-entry-primary min-w-0 leading-snug";
const metaClass =
  "resume-entry-meta inline-block w-max max-w-none shrink-0 leading-tight";
const dateGroupClass =
  "text-muted-foreground flex shrink-0 items-baseline gap-1 text-sm font-medium leading-tight";

function shouldShowField(
  degree: string,
  field: string | null | undefined,
): boolean {
  const f = field?.trim();
  if (!f) return false;
  const d = degree.replace(/<[^>]+>/g, "").trim().toLowerCase();
  const normalized = f.toLowerCase();
  if (d === normalized) return false;
  if (d.endsWith(normalized) || d.includes(` in ${normalized}`)) return false;
  return true;
}

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
  const degree = edu?.degree ?? "";
  const degreePlain = degree.replace(/<[^>]+>/g, "").trim();
  const showField = shouldShowField(degreePlain, edu?.field);
  const highlights = edu?.highlights?.filter(Boolean) ?? [];

  const showDegreeRow =
    fieldHasContent(edu?.degree) ||
    (showField && fieldHasContent(edu?.field)) ||
    fieldHasContent(edu?.gpa);

  return (
    <div className="mb-2 min-w-0 space-y-0.5">
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
          <div
            className={cn(
              primaryClass,
              "resume-entry-degree-line text-muted-foreground min-w-0 text-sm leading-snug italic",
            )}
          >
            <EditableText
              path={`education.${index}.degree`}
              mode="inline"
              inlineWrap
              className="inline min-w-0"
              editorClassName="whitespace-normal leading-snug py-0"
            />
            {showField ? (
              <>
                <span className="not-italic"> in </span>
                <EditableText
                  path={`education.${index}.field`}
                  mode="inline"
                  inlineWrap
                  className="inline min-w-0"
                  editorClassName="whitespace-normal leading-snug py-0"
                />
              </>
            ) : null}
          </div>
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
