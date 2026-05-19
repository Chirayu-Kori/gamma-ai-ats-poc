"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./creative-theme.css";

export function CreativeTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume creative-theme resume-theme-base ring-border mx-auto w-full max-w-5xl min-w-0 overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <div className="creative-accent-bar" />
      <header className="px-8 pt-8 pb-4 sm:px-10">
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
            <EditableText
              path="contact.email"
              mode="inline"
              className="creative-chip"
            />
          )}
          {contact.phone && (
            <EditableText
              path="contact.phone"
              mode="inline"
              className="creative-chip"
            />
          )}
          {contact.location && (
            <EditableText
              path="contact.location"
              mode="inline"
              className="creative-chip"
            />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-[1fr_280px] sm:px-10">
        <div className="space-y-6">
          <section>
            <h2 className="creative-section-title mb-2">About</h2>
            <EditableText
              path="summary"
              mode="block"
              className="text-sm leading-relaxed"
            />
          </section>

          {resume.experience && resume.experience.length > 0 && (
            <section>
              <h2 className="creative-section-title mb-3">Experience</h2>
              <SortableExperienceList />
            </section>
          )}

          {resume.education && resume.education.length > 0 && (
            <section>
              <h2 className="creative-section-title mb-3">Education</h2>
              <SortableEducationList />
            </section>
          )}
        </div>

        <aside className="creative-sidebar space-y-5 rounded-xl p-5">
          {resume.skills && resume.skills.length > 0 && (
            <section>
              <h2 className="creative-sidebar-title mb-2">Skills</h2>
              <div className="space-y-2 text-sm">
                {resume.skills.map((_, i) => (
                  <SkillsRow key={i} index={i} />
                ))}
              </div>
            </section>
          )}

          {resume.certifications && resume.certifications.length > 0 && (
            <section>
              <h2 className="creative-sidebar-title mb-2">Certifications</h2>
              <ul className="space-y-1 text-sm">
                {resume.certifications.map((c, i) => (
                  <li key={i} className="creative-cert-item">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
