"use client";

import { Mail } from "lucide-react";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import { SortableSkillsList } from "@/components/editor/sortable-skills-list";
import { EditableSectionTitle } from "@/components/editor/editable-section-title";
import type { ContactInfo } from "@/lib/types/resume";
import { ResumeContactSidebar } from "./resume-contact";
import "./atlantic-theme.css";

export function AtlanticTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);
  const skillsSection = resume.sections?.find(
    (section) => section.type === "skills" && section.visible,
  );

  return (
    <article
      className="resume atlantic-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[minmax(10rem,240px)_minmax(0,1fr)] overflow-x-clip rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="atlantic-sidebar min-w-0 space-y-6 p-6">
        <div
          id="resume-header"
          data-section-type="headline"
          className="scroll-mt-24"
        >
          <EditableText
            path="name"
            mode="inline"
            inlineWrap
            className="font-heading block text-xl leading-tight font-bold"
          />
          <EditableText
            path="headline"
            mode="inline"
            inlineWrap
            className="mt-1 block text-xs opacity-75"
          />
        </div>

        <div>
          <h2 className="atlantic-sidebar-heading resume-section-title mb-2 flex items-center gap-1.5">
            <Mail className="resume-contact-icon size-3.5" strokeWidth={2} aria-hidden />
            Contact
          </h2>
          <ResumeContactSidebar
            contact={contact}
            keys={["email", "phone", "location", "linkedin", "github", "website"]}
          />
        </div>

        {skillsSection && resume.skills && resume.skills.length > 0 && (
          <div id={`section-${skillsSection.id}`} className="scroll-mt-24">
            <EditableSectionTitle
              sectionId={skillsSection.id}
              className="atlantic-sidebar-heading mb-2"
            />
            <div className="text-sm">
              <SortableSkillsList variant="stacked" />
            </div>
          </div>
        )}
      </aside>

      <main className="resume-main-column min-w-0 p-8">
        <ResumeDynamicSections
          titleVariant="atlantic"
          excludeTypes={["skills"]}
        />
      </main>
    </article>
  );
}
