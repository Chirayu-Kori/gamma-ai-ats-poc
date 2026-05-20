"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "../../stores/resumeStore";
import { EditableText } from "../editor/EditableText";
import { ResumeDynamicSections } from "../editor/resume-dynamic-sections";
import type { ContactInfo } from "../../lib/types/resume";
import { ResumeContactBar } from "./resume-contact";
import "./minimal-theme.css";

export function MinimalTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  const themeStyle = resumeThemeToCssVars(theme);

  if (!resume) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-muted mx-auto h-10 w-1/3 rounded" />
        <div className="bg-muted mx-auto h-4 w-1/2 rounded" />
        <div className="mt-8 space-y-2">
          <div className="bg-muted h-4 w-1/4 rounded" />
          <div className="bg-muted h-4 w-full rounded" />
          <div className="bg-muted h-4 w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <article
      className="resume minimal-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 overflow-x-clip rounded-sm p-8 shadow-lg ring-1 sm:p-12"
      style={themeStyle}
    >
      <header
        id="resume-header"
        data-section-type="headline"
        className="mb-8 min-w-0 shrink-0 scroll-mt-24 text-center"
      >
        <EditableText
          path="name"
          mode="inline"
          inlineWrap
          inlineMultiline
          className="font-heading block text-3xl font-black tracking-tight"
        />
        <EditableText
          path="headline"
          mode="inline"
          inlineWrap
          inlineMultiline
          className="text-muted-foreground mt-1 block text-lg"
        />
        <ResumeContactBar contact={resume.contact || ({} as ContactInfo)} />
      </header>

      <ResumeDynamicSections titleVariant="default" />
    </article>
  );
}
