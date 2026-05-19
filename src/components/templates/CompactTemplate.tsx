"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./compact-theme.css";

export function CompactTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume compact-theme resume-theme-base ring-border mx-auto w-full max-w-2xl min-w-0 rounded-sm p-6 shadow-lg ring-1 sm:p-8"
      style={resumeThemeToCssVars(theme)}
    >
      <header className="compact-header mb-4 border-b pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <EditableText
            path="name"
            mode="inline"
            className="font-heading text-xl font-bold"
          />
          <EditableText
            path="headline"
            mode="inline"
            className="text-xs font-medium tracking-wide uppercase opacity-70"
          />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] opacity-75">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>{contact.location}</span>}
        </div>
      </header>

      <section className="mb-4">
        <h2 className="compact-label mb-1">Summary</h2>
        <EditableText path="summary" mode="block" className="text-xs leading-snug" />
      </section>

      {resume.experience && resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="compact-label mb-2">Experience</h2>
          <SortableExperienceList />
        </section>
      )}

      <div className="grid grid-cols-2 gap-4">
        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="compact-label mb-2">Education</h2>
            <SortableEducationList />
          </section>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <section>
            <h2 className="compact-label mb-2">Skills</h2>
            <div className="space-y-1">
              {resume.skills.map((_, i) => (
                <SkillsRow key={i} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {resume.certifications && resume.certifications.length > 0 && (
        <section className="mt-4">
          <h2 className="compact-label mb-1">Certifications</h2>
          <ul className="list-disc pl-4 text-xs">
            {resume.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
