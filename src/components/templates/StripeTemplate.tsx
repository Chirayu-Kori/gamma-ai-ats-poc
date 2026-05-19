"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import "./stripe-theme.css";

export function StripeTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume stripe-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <div className="stripe-layout flex min-h-full">
        <div className="stripe-bar shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 p-8 sm:p-10">
          <header id="resume-header" className="mb-8 scroll-mt-24">
            <EditableText
              path="name"
              mode="inline"
              className="font-heading block text-3xl font-black"
            />
            <EditableText
              path="headline"
              mode="inline"
              className="mt-1 block text-base opacity-70"
            />
            <div className="mt-3 flex flex-wrap gap-x-4 text-sm opacity-80">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>{contact.location}</span>}
            </div>
          </header>

          <ResumeDynamicSections titleVariant="stripe" />
        </div>
      </div>
    </article>
  );
}
