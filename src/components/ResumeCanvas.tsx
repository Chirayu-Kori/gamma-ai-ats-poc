"use client";

import { FileText } from "lucide-react";

import { useResumeStore } from "../stores/resumeStore";
import { TEMPLATES } from "./templates/registry";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);

  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  // Empty state — happens briefly while the record is loading after navigation,
  // or if something went wrong with parse/upgrade.
  const isEmpty =
    !resume ||
    (!resume.name &&
      !resume.headline &&
      !resume.summary &&
      (!resume.experience || resume.experience.length === 0));

  if (isEmpty && status !== "generating") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="rounded-full bg-blue-50 p-4">
          <FileText className="size-7 text-blue-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          Loading your resume…
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          If this stays empty, the upgrade didn&apos;t save. Try opening this
          resume again from the workspace, or re-upload.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex w-full min-w-0 justify-center p-4 md:p-8 print:bg-white print:p-0">
      <Component />
    </div>
  );
}
