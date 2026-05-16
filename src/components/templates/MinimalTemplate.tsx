"use client";

import { useResumeStore } from "../../stores/resumeStore";
import { EditableText } from "../editor/EditableText";
import { SortableExperienceList } from "../editor/sortable-experience-list";
import { SortableEducationList } from "../editor/sortable-education-list";
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
    <div className="text-muted-foreground mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
      {parts.map((p, i) => (
        <span key={p.key} className="flex items-center gap-3">
          <EditableText path={`contact.${p.key}`} mode="inline" />
          {i < parts.length - 1 && (
            <span className="text-border text-xs">•</span>
          )}
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
    <section className="mb-6">
      <h2 className="mb-3 pb-1 font-semibold tracking-wider uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SkillsRow({ index }: { index: number }) {
  return (
    <div className="mb-2 flex items-baseline">
      <EditableText
        path={`skills.${index}.category`}
        mode="inline"
        className="w-32 shrink-0 font-semibold capitalize"
      />
      <div className="flex-1">
        <EditableText
          path={`skills.${index}.items.0`}
          mode="inline"
          placeholder="Skill 1, Skill 2, etc."
        />
      </div>
    </div>
  );
}

export function MinimalTemplate() {
  const resume = useResumeStore((s) => s.resume);

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
    <article className="resume minimal-theme ring-border mx-auto min-h-screen max-w-4xl rounded-sm bg-white p-8 text-black shadow-lg ring-1 sm:p-12">
      <header className="mb-8 shrink-0 text-center">
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

      <div className="space-y-6">
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
            {resume.skills.map((_, i) => (
              <SkillsRow key={i} index={i} />
            ))}
          </Section>
        )}
      </div>
    </article>
  );
}
