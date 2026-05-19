"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
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

  return (
    <article
      className="resume atlantic-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[240px_1fr] overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="atlantic-sidebar space-y-6 p-6">
        <div>
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

        {resume.skills && resume.skills.length > 0 && (
          <div>
            <h2 className="atlantic-sidebar-heading mb-2">Skills</h2>
            <div className="space-y-2 text-sm">
              {resume.skills.map((_, i) => (
                <SkillsRow key={i} index={i} />
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="space-y-6 p-8">
        <section>
          <h2 className="atlantic-main-heading mb-2">Profile</h2>
          <EditableText path="summary" mode="block" className="text-sm leading-relaxed" />
        </section>

        {resume.experience && resume.experience.length > 0 && (
          <section>
            <h2 className="atlantic-main-heading mb-3">Experience</h2>
            <SortableExperienceList />
          </section>
        )}

        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="atlantic-main-heading mb-3">Education</h2>
            <SortableEducationList />
          </section>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <h2 className="atlantic-main-heading mb-2">Certifications</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {resume.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </article>
  );
}
