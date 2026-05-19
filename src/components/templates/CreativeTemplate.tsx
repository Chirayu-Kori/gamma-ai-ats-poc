"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import { EditableSectionTitle } from "@/components/editor/editable-section-title";
import { ResumeSectionContent } from "@/components/editor/resume-section-content";
import type { ContactInfo } from "@/lib/types/resume";
import "./creative-theme.css";

export function CreativeTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);
  const sidebarSections = (resume.sections ?? []).filter(
    (section) =>
      section.visible &&
      (section.type === "skills" || section.type === "certifications"),
  );

  return (
    <article
      className="resume creative-theme resume-theme-base ring-border mx-auto w-full max-w-5xl min-w-0 overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <div className="creative-accent-bar" />
      <header
        id="resume-header"
        data-section-type="headline"
        className="scroll-mt-24 px-8 pt-8 pb-4 sm:px-10"
      >
        <EditableText
          path="name"
          mode="inline"
          className="font-heading block text-4xl font-black"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="mt-1 block text-lg opacity-75"
        />
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {contact.email && (
            <EditableText path="contact.email" mode="inline" className="creative-chip" />
          )}
          {contact.phone && (
            <EditableText path="contact.phone" mode="inline" className="creative-chip" />
          )}
          {contact.location && (
            <EditableText path="contact.location" mode="inline" className="creative-chip" />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-[1fr_280px] sm:px-10">
        <ResumeDynamicSections
          titleVariant="creative"
          excludeTypes={["skills", "certifications"]}
        />

        {sidebarSections.length > 0 && (
          <aside className="creative-sidebar space-y-5 rounded-xl p-5">
            {sidebarSections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-24"
              >
                <EditableSectionTitle
                  sectionId={section.id}
                  className="creative-sidebar-title mb-2"
                />
                <ResumeSectionContent section={section} />
              </section>
            ))}
          </aside>
        )}
      </div>
    </article>
  );
}
