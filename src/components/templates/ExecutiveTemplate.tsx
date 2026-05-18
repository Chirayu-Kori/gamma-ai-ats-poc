"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./executive-theme.css";

function ContactLine({ contact }: { contact: ContactInfo }) {
  const parts: string[] = [];
  if (contact?.email) parts.push(contact.email);
  if (contact?.phone) parts.push(contact.phone);
  if (contact?.location) parts.push(contact.location);
  if (contact?.linkedin) parts.push(contact.linkedin);
  if (contact?.website) parts.push(contact.website);
  if (!parts.length) return null;
  return (
    <p className="mt-2 text-sm tracking-wide text-slate-600">
      {parts.join("   •   ")}
    </p>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="resume-heading mb-3 text-xs font-bold tracking-[0.2em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ExecutiveTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);

  if (!resume) return null;

  return (
    <article
      className="resume executive-theme ring-border mx-auto w-full max-w-4xl min-w-0 rounded-sm bg-white p-10 text-black shadow-lg ring-1 sm:p-14"
      style={resumeThemeToCssVars(theme)}
    >
      <header className="mb-8 border-b-2 pb-6 text-center">
        <EditableText
          path="name"
          mode="inline"
          className="resume-heading block text-4xl font-black uppercase"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="mt-2 block text-sm tracking-[0.25em] text-slate-500 uppercase"
        />
        <ContactLine contact={resume.contact || ({} as ContactInfo)} />
      </header>

      <Section title="Profile">
        <EditableText
          path="summary"
          mode="block"
          className="text-sm leading-relaxed text-slate-700"
        />
      </Section>

      {resume.experience && resume.experience.length > 0 && (
        <Section title="Professional Experience">
          <SortableExperienceList />
        </Section>
      )}

      {resume.education && resume.education.length > 0 && (
        <Section title="Education">
          <SortableEducationList />
        </Section>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <Section title="Core Competencies">
          <div className="space-y-2">
            {resume.skills.map((_, i) => (
              <SkillsRow key={i} index={i} />
            ))}
          </div>
        </Section>
      )}

      {resume.certifications && resume.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {resume.certifications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
