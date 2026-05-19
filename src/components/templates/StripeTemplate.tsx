"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./stripe-theme.css";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="stripe-section-title mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function StripeTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  if (!resume) return null;

  const contact = resume.contact ?? ({} as ContactInfo);

  return (
    <article
      className="resume stripe-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <div className="stripe-layout flex min-h-full">
        <div className="stripe-bar shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 p-8 sm:p-10">
          <header className="mb-8">
            <EditableText
              path="name"
              mode="inline"
              className="font-heading block text-3xl font-black"
            />
            <EditableText
              path="headline"
              mode="inline"
              className="mt-1 block text-base opacity-70"
            />
            <div className="mt-3 flex flex-wrap gap-x-4 text-sm opacity-80">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>{contact.location}</span>}
            </div>
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
        </div>
      </div>
    </article>
  );
}
