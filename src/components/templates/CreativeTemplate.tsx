"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import { EditableSectionTitle } from "@/components/editor/editable-section-title";
import { ResumeSectionContent } from "@/components/editor/resume-section-content";
import type { ContactInfo } from "@/lib/types/resume";
import { ResumeContactChips } from "./resume-contact";
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
      className="resume creative-theme resume-theme-base ring-border mx-auto w-full max-w-5xl min-w-0 overflow-x-clip rounded-sm shadow-lg ring-1"
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
          inlineWrap
          className="font-heading block text-4xl font-black"
        />
        <EditableText
          path="headline"
          mode="inline"
          inlineWrap
          className="mt-1 block text-lg opacity-75"
        />
        <ResumeContactChips
          contact={contact}
          keys={["email", "phone", "location", "linkedin", "github", "website"]}
          chipClassName="creative-chip"
          className="mt-3"
        />
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,280px)] sm:px-10">
        <ResumeDynamicSections
          titleVariant="creative"
          excludeTypes={["skills", "certifications"]}
        />

        {sidebarSections.length > 0 && (
          <aside className="creative-sidebar min-w-0 space-y-5 rounded-xl p-5">
            {sidebarSections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                data-section-id={section.id}
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
