"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import { ResumeContactInline } from "./resume-contact";
import "./compact-theme.css";

export function CompactTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  return (
    <article
      className="resume compact-theme resume-theme-base ring-border mx-auto w-full max-w-2xl min-w-0 rounded-sm p-6 shadow-lg ring-1 sm:p-8"
      style={resumeThemeToCssVars(theme)}
    >
      <header
        id="resume-header"
        data-section-type="headline"
        className="compact-header mb-4 scroll-mt-24 border-b pb-3"
      >
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
          <EditableText
            path="name"
            mode="inline"
            inlineWrap
            inlineMultiline
            className="font-heading min-w-0 text-xl font-bold"
          />
          <EditableText
            path="headline"
            mode="inline"
            inlineWrap
            inlineMultiline
            className="min-w-0 text-xs font-medium tracking-wide uppercase opacity-70"
          />
        </div>
        <ResumeContactInline
          contact={resume.contact ?? ({} as ContactInfo)}
          className="mt-1 justify-start gap-x-3 gap-y-1 text-[11px] opacity-75"
        />
      </header>

      <ResumeDynamicSections titleVariant="compact" sectionClassName="mb-4" />
    </article>
  );
}
