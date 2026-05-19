"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./classic-theme.css";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="classic-section-title mb-3 text-center text-sm font-bold tracking-[0.3em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ClassicTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);
  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  return (
    <article
      className="resume classic-theme resume-theme-base ring-border mx-auto w-full max-w-3xl min-w-0 rounded-sm p-10 shadow-lg ring-1 sm:p-12"
      style={resumeThemeToCssVars(theme)}
    >
      <header className="classic-header mb-8 text-center">
        <div className="classic-rule mb-4" />
        <EditableText
          path="name"
          mode="inline"
          className="font-heading block text-3xl font-bold tracking-wide"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="mt-2 block text-sm tracking-[0.2em] uppercase opacity-70"
        />
        {contactParts.length > 0 && (
          <p className="mt-3 text-xs tracking-wide opacity-80">
            {contactParts.join("  ·  ")}
          </p>
        )}
        <div className="classic-rule mt-4" />
      </header>

      <Section title="Summary">
        <EditableText
          path="summary"
          mode="block"
          className="text-sm leading-relaxed"
        />
      </Section>

      {resume.experience && resume.experience.length > 0 && (
        <Section title="Experience">
          <SortableExperienceList />
        </Section>
      )}

      {resume.education && resume.education.length > 0 && (
        <Section title="Education">
          <SortableEducationList />
        </Section>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <Section title="Skills">
          <div className="space-y-2">
            {resume.skills.map((_, i) => (
              <SkillsRow key={i} index={i} />
            ))}
          </div>
        </Section>
      )}

      {resume.certifications && resume.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {resume.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
