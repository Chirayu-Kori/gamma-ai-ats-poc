"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import "./executive-theme.css";

function ContactLine({ contact }: { contact: ContactInfo }) {
  const parts: string[] = [];
  if (contact?.email) parts.push(contact.email);
  if (contact?.phone) parts.push(contact.phone);
  if (contact?.location) parts.push(contact.location);
  if (contact?.linkedin) parts.push(contact.linkedin);
  if (contact?.website) parts.push(contact.website);
  if (!parts.length) return null;
  return (
    <p className="mt-2 text-sm tracking-wide text-slate-600">
      {parts.join("   •   ")}
    </p>
  );
}

export function ExecutiveTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);

  if (!resume) return null;

  return (
    <article
      className="resume executive-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 rounded-sm p-10 shadow-lg ring-1 sm:p-14"
      style={resumeThemeToCssVars(theme)}
    >
      <header
        id="resume-header"
        data-section-type="headline"
        className="mb-8 scroll-mt-24 border-b-2 pb-6 text-center"
      >
        <EditableText
          path="name"
          mode="inline"
          className="resume-heading block text-4xl font-black uppercase"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="mt-2 block text-sm tracking-[0.25em] text-slate-500 uppercase"
        />
        <ContactLine contact={resume.contact || ({} as ContactInfo)} />
      </header>

      <ResumeDynamicSections titleVariant="executive" />
    </article>
  );
}
