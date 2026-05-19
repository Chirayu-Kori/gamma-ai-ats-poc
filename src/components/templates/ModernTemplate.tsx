"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { getSectionTitle } from "@/lib/resume-sections";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import { SortableSkillsList } from "@/components/editor/sortable-skills-list";
import { EditableSectionTitle } from "@/components/editor/editable-section-title";
import type { ContactInfo } from "@/lib/types/resume";
import "./modern-theme.css";

function SidebarContactItem({
  label,
  value,
  path,
}: {
  label: string;
  value: string | null | undefined;
  path: string;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] tracking-wider opacity-70 uppercase">
        {label}
      </div>
      <EditableText
        path={path}
        mode="inline"
        className="block text-sm break-words"
      />
    </div>
  );
}

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
      className="resume modern-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[260px_1fr] overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="modern-sidebar space-y-7 p-6">
        <div
          id="resume-header"
          data-section-type="headline"
          className="scroll-mt-24"
        >
          <EditableText
            path="name"
            mode="inline"
            className="block text-2xl leading-tight font-black"
          />
          <EditableText
            path="headline"
            mode="inline"
            className="mt-1 block text-sm opacity-85"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase">
            Contact
          </h2>
          <SidebarContactItem
            label="Email"
            value={contact.email}
            path="contact.email"
          />
          <SidebarContactItem
            label="Phone"
            value={contact.phone}
            path="contact.phone"
          />
          <SidebarContactItem
            label="Location"
            value={contact.location}
            path="contact.location"
          />
          <SidebarContactItem
            label="LinkedIn"
            value={contact.linkedin}
            path="contact.linkedin"
          />
          <SidebarContactItem
            label="GitHub"
            value={contact.github}
            path="contact.github"
          />
          <SidebarContactItem
            label="Website"
            value={contact.website}
            path="contact.website"
          />
        </div>

        {skillsSection && resume.skills && resume.skills.length > 0 && (
          <div id={`section-${skillsSection.id}`} className="scroll-mt-24">
            <EditableSectionTitle
              sectionId={skillsSection.id}
              className="mb-2 text-xs font-semibold tracking-wider uppercase"
            />
            <div className="text-sm">
              <SortableSkillsList />
            </div>
          </div>
        )}
      </aside>

      <main className="modern-main p-8">
        <ResumeDynamicSections
          titleVariant="modern"
          excludeTypes={["skills"]}
        />
      </main>
    </article>
  );
}
