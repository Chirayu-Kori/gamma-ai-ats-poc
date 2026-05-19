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
import "./modern-theme.css";

export function ModernTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);

  if (!resume) return null;
  const contact = (resume.contact ?? {}) as ContactInfo;
  const skillsSection = resume.sections?.find(
    (section) => section.type === "skills" && section.visible,
  );

  return (
    <article
      className="resume modern-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[minmax(11rem,260px)_minmax(0,1fr)] overflow-x-clip rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="modern-sidebar min-w-0 space-y-7 p-6">
        <div
          id="resume-header"
          data-section-type="headline"
          className="scroll-mt-24"
        >
          <EditableText
            path="name"
            mode="inline"
            inlineWrap
            className="block text-2xl leading-tight font-black"
          />
          <EditableText
            path="headline"
            mode="inline"
            inlineWrap
            className="mt-1 block text-sm opacity-85"
          />
        </div>

        <div>
          <h2 className="resume-section-title mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] uppercase">
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
              className="mb-2 text-xs font-semibold tracking-[0.1em] uppercase"
            />
            <div className="text-sm">
              <SortableSkillsList />
            </div>
          </div>
        )}
      </aside>

      <main className="modern-main resume-main-column min-w-0 p-8">
        <ResumeDynamicSections
          titleVariant="modern"
          excludeTypes={["skills"]}
        />
      </main>
    </article>
  );
}
