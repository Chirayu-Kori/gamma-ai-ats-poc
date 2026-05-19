"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import { ResumeContactInline } from "./resume-contact";
import "./classic-theme.css";

export function ClassicTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  return (
    <article
      className="resume classic-theme resume-theme-base ring-border mx-auto w-full max-w-3xl min-w-0 rounded-sm p-10 shadow-lg ring-1 sm:p-12"
      style={resumeThemeToCssVars(theme)}
    >
      <header
        id="resume-header"
        data-section-type="headline"
        className="classic-header mb-8 scroll-mt-24 text-center"
      >
        <div className="classic-rule mb-4" />
        <EditableText
          path="name"
          mode="inline"
          inlineWrap
          className="font-heading block text-3xl font-bold tracking-wide"
        />
        <EditableText
          path="headline"
          mode="inline"
          inlineWrap
          className="mt-2 block text-sm tracking-[0.12em] uppercase opacity-70"
        />
        <ResumeContactInline
          contact={resume.contact ?? ({} as ContactInfo)}
          className="mt-3 justify-center text-xs opacity-80"
        />
        <div className="classic-rule mt-4" />
      </header>

      <ResumeDynamicSections titleVariant="classic" />
    </article>
  );
}
