"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { ResumeDynamicSections } from "@/components/editor/resume-dynamic-sections";
import { SkillsRow } from "@/components/editor/skills-row";
import { EditableSectionTitle } from "@/components/editor/editable-section-title";
import type { ContactInfo } from "@/lib/types/resume";
import "./atlantic-theme.css";

function SidebarContact({
  label,
  path,
  value,
}: {
  label: string;
  path: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider uppercase opacity-60">
        {label}
      </div>
      <EditableText path={path} mode="inline" className="text-sm" />
    </div>
  );
}

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
      className="resume atlantic-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[240px_1fr] overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="atlantic-sidebar space-y-6 p-6">
        <div id="resume-header" className="scroll-mt-24">
          <EditableText
            path="name"
            mode="inline"
            className="font-heading block text-xl font-bold leading-tight"
          />
          <EditableText
            path="headline"
            mode="inline"
            className="mt-1 block text-xs opacity-75"
          />
        </div>

        <div className="space-y-3">
          <h2 className="atlantic-sidebar-heading">Contact</h2>
          <SidebarContact label="Email" path="contact.email" value={contact.email} />
          <SidebarContact label="Phone" path="contact.phone" value={contact.phone} />
          <SidebarContact label="Location" path="contact.location" value={contact.location} />
          <SidebarContact label="LinkedIn" path="contact.linkedin" value={contact.linkedin} />
        </div>

        {skillsSection && resume.skills && resume.skills.length > 0 && (
          <div id={`section-${skillsSection.id}`} className="scroll-mt-24">
            <EditableSectionTitle
              sectionId={skillsSection.id}
              className="atlantic-sidebar-heading mb-2"
            />
            <div className="space-y-2 text-sm">
              {resume.skills.map((_, i) => (
                <SkillsRow key={i} index={i} />
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="p-8">
        <ResumeDynamicSections
          titleVariant="atlantic"
          excludeTypes={["skills"]}
        />
      </main>
    </article>
  );
}
