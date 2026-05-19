"use client";

import { useEffect } from "react";
import { FileText } from "lucide-react";

import { mergeThemeDefaults, pageSizeCssVars } from "@/lib/resume-theme";
import { isSectionSelectionTarget } from "@/lib/section-selection";
import { useResumeStore } from "../stores/resumeStore";
import { CanvasSaveBar } from "./editor/canvas-save-bar";
import { StreamingSectionEffects } from "./editor/streaming-section-effects";
import { TEMPLATES } from "./templates/registry";
import "./templates/shared-template.css";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);
  const theme = useResumeStore((s) => s.theme);
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);
  const pageVars = pageSizeCssVars(mergeThemeDefaults(theme));
  const setSelectedSectionId = useResumeStore((s) => s.setSelectedSectionId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedSectionId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSelectedSectionId]);

  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  const isEmpty =
    !resume ||
    (!resume.name &&
      !resume.headline &&
      !resume.summary &&
      (!resume.experience || resume.experience.length === 0));

  if (isEmpty && status !== "generating" && status !== "streaming") {
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

  const clearSectionSelection = (e: React.MouseEvent) => {
    if (isSectionSelectionTarget(e.target)) return;
    setSelectedSectionId(null);
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col">
      <div
        className="bg-muted/30 flex w-full min-w-0 justify-center p-4 md:p-8 print:bg-white print:p-0"
        onClick={clearSectionSelection}
      >
        <div className="resume-page-format w-full min-w-0" style={pageVars}>
          <StreamingSectionEffects />
          <Component />
        </div>
      </div>
      <CanvasSaveBar />
    </div>
  );
}
