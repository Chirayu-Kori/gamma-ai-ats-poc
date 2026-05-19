"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import type { ContactInfo } from "@/lib/types/resume";
import { ResumeContactInline } from "./resume-contact";
import "./stripe-theme.css";

export function StripeTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  return (
    <article
      className="resume stripe-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <div className="stripe-layout flex min-h-full min-w-0">
        <div className="stripe-bar shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 p-8 sm:p-10">
          <header
            id="resume-header"
            data-section-type="headline"
            className="mb-8 scroll-mt-24"
          >
            <EditableText
              path="name"
              mode="inline"
              inlineWrap
              className="font-heading block text-3xl font-black"
            />
            <EditableText
              path="headline"
              mode="inline"
              inlineWrap
              className="mt-1 block text-base opacity-70"
            />
            <ResumeContactInline
              contact={resume.contact ?? ({} as ContactInfo)}
              className="mt-3 justify-start text-sm opacity-80"
            />
          </header>

          <ResumeDynamicSections titleVariant="stripe" />
        </div>
      </div>
    </article>
  );
}
