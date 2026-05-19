"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "./EditableText";

const compactInline = "whitespace-nowrap break-normal";

function shouldShowField(
  degree: string,
  field: string | null | undefined,
): boolean {
  const f = field?.trim();
  if (!f) return false;
  const d = degree.trim().toLowerCase();
  const normalized = f.toLowerCase();
  if (d === normalized) return false;
  if (d.endsWith(normalized) || d.includes(` in ${normalized}`)) return false;
  return true;
}

function EducationDates({ index }: { index: number }) {
  const start = useResumeStore((s) => s.resume?.education?.[index]?.start);
  const end = useResumeStore((s) => s.resume?.education?.[index]?.end);
  const hasStart = Boolean(start?.trim());
  const hasEnd = Boolean(end?.trim());

  const dateClass =
    "text-muted-foreground flex shrink-0 items-center gap-1 text-sm";

  if (hasStart && hasEnd) {
    return (
      <div className={dateClass}>
        <EditableText
          path={`education.${index}.start`}
          mode="inline"
          className={compactInline}
        />
        <span aria-hidden>–</span>
        <EditableText
          path={`education.${index}.end`}
          mode="inline"
          className={compactInline}
        />
      </div>
    );
  }

  if (hasEnd) {
    return (
      <div className={dateClass}>
        <EditableText
          path={`education.${index}.end`}
          mode="inline"
          className={compactInline}
        />
      </div>
    );
  }

  if (hasStart) {
    return (
      <div className={dateClass}>
        <EditableText
          path={`education.${index}.start`}
          mode="inline"
          className={compactInline}
        />
      </div>
    );
  }

  return (
    <div className={dateClass}>
      <EditableText
        path={`education.${index}.end`}
        mode="inline"
        className={compactInline}
        placeholder="Graduation date"
      />
    </div>
  );
}

export function EducationBlock({ index }: { index: number }) {
  const edu = useResumeStore((s) => s.resume?.education?.[index]);
  const degree = edu?.degree ?? "";
  const showField = shouldShowField(degree, edu?.field);
  const gpa = edu?.gpa?.trim();
  const highlights = edu?.highlights?.filter(Boolean) ?? [];

  return (
    <div className="mb-2 min-w-0">
      <div className="mb-1 flex min-w-0 items-baseline justify-between gap-4">
        <div className="min-w-0 flex-1 overflow-hidden">
          <EditableText
            path={`education.${index}.institution`}
            mode="inline"
            className={`min-w-0 text-base font-bold ${compactInline}`}
          />
        </div>
        <EducationDates index={index} />
      </div>

      <div className="mb-1 flex min-w-0 items-baseline justify-between gap-4">
        <div className="text-muted-foreground min-w-0 flex-1 text-sm leading-snug italic">
          <EditableText
            path={`education.${index}.degree`}
            mode="inline"
            className="min-w-0"
          />
          {showField && (
            <>
              <span className="not-italic"> in </span>
              <EditableText
                path={`education.${index}.field`}
                mode="inline"
                className="min-w-0"
              />
            </>
          )}
        </div>
        {gpa ? (
          <EditableText
            path={`education.${index}.gpa`}
            mode="inline"
            className={`text-muted-foreground shrink-0 text-sm ${compactInline}`}
            placeholder="GPA"
          />
        ) : null}
      </div>

      {highlights.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
          {highlights.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
