"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import "./compact-theme.css";

export function CompactTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume compact-theme resume-theme-base ring-border mx-auto w-full max-w-2xl min-w-0 rounded-sm p-6 shadow-lg ring-1 sm:p-8"
      style={resumeThemeToCssVars(theme)}
    >
      <header
        id="resume-header"
        className="compact-header mb-4 scroll-mt-24 border-b pb-3"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <EditableText
            path="name"
            mode="inline"
            className="font-heading text-xl font-bold"
          />
          <EditableText
            path="headline"
            mode="inline"
            className="text-xs font-medium tracking-wide uppercase opacity-70"
          />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] opacity-75">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </header>

      <ResumeDynamicSections titleVariant="compact" sectionClassName="mb-4" />
    </article>
  );
}
