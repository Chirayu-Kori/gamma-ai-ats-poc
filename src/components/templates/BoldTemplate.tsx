"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import "./bold-theme.css";

export function BoldTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume bold-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <header
        id="resume-header"
        data-section-type="headline"
        className="bold-header scroll-mt-24 px-8 py-10 text-white sm:px-12"
      >
        <EditableText
          path="name"
          mode="inline"
          className="font-heading block text-4xl font-black tracking-tight"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="mt-2 block text-base opacity-90"
        />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-85">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.linkedin && <span>{contact.linkedin}</span>}
        </div>
      </header>

      <div className="space-y-2 p-8 sm:p-10">
        <ResumeDynamicSections titleVariant="bold" />
      </div>
    </article>
  );
}
