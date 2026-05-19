"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "../../stores/resumeStore";
import { EditableText } from "../editor/EditableText";
import { SortableExperienceList } from "../editor/sortable-experience-list";
import { SortableEducationList } from "../editor/sortable-education-list";
import { SkillsRow } from "../editor/skills-row";
import { ContactInfo } from "../../lib/types/resume";
import "./minimal-theme.css";

function ContactBar({ contact }: { contact: ContactInfo }) {
  if (!contact) return null;
  const parts: { key: keyof ContactInfo; value: string }[] = [];
  if (contact.email) parts.push({ key: "email", value: contact.email });
  if (contact.phone) parts.push({ key: "phone", value: contact.phone });
  if (contact.location)
    parts.push({ key: "location", value: contact.location });
  if (contact.linkedin)
    parts.push({ key: "linkedin", value: contact.linkedin });
  if (contact.github) parts.push({ key: "github", value: contact.github });
  if (contact.website) parts.push({ key: "website", value: contact.website });

  return (
    <div className="text-muted-foreground mt-2 flex w-full min-w-0 items-center text-sm">
      {parts.map((p, i) => (
        <span key={p.key} className="contents">
          <span className="flex min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden px-2 text-center">
            <EditableText
              path={`contact.${p.key}`}
              mode="inline"
              className="w-full break-normal whitespace-nowrap"
            />
          </span>
          {i < parts.length - 1 ? (
            <span className="text-border shrink-0 px-0.5 text-xs" aria-hidden>
              •
            </span>
          ) : null}
        </span>
      ))}
    </div>
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
    <section className="mb-6 min-w-0">
      <h2 className="mb-3 pb-1 font-semibold tracking-wider uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MinimalTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);
  const themeStyle = resumeThemeToCssVars(theme);

  if (!resume) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-muted mx-auto h-10 w-1/3 rounded"></div>
        <div className="bg-muted mx-auto h-4 w-1/2 rounded"></div>
        <div className="mt-8 space-y-2">
          <div className="bg-muted h-4 w-1/4 rounded"></div>
          <div className="bg-muted h-4 w-full rounded"></div>
          <div className="bg-muted h-4 w-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <article
      className="resume minimal-theme resume-theme-base ring-border mx-auto w-full max-w-4xl min-w-0 overflow-x-clip rounded-sm p-8 shadow-lg ring-1 sm:p-12"
      style={themeStyle}
    >
      <header className="mb-8 min-w-0 shrink-0 text-center">
        <EditableText
          path="name"
          mode="inline"
          className="font-heading block text-3xl font-black tracking-tight"
        />
        <EditableText
          path="headline"
          mode="inline"
          className="text-muted-foreground mt-1 block text-lg"
        />
        <ContactBar contact={resume.contact || ({} as ContactInfo)} />
      </header>

      <div className="min-w-0 space-y-6">
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
            <div className="space-y-3">
              {resume.skills.map((_, i) => (
                <SkillsRow key={i} index={i} />
              ))}
            </div>
          </Section>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {resume.certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </article>
  );
}
