"use client";

import { useResumeStore } from "../../stores/resumeStore";
import { EditableText } from "../editor/EditableText";
import { BulletList } from "../editor/BulletList";
import { ContactInfo } from "../../lib/types/resume";
import "./minimal-theme.css";

function ContactBar({ contact }: { contact: ContactInfo }) {
  if (!contact) return null;
  const parts = [];
  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);
  if (contact.location) parts.push(contact.location);
  if (contact.linkedin) parts.push(contact.linkedin);
  if (contact.github) parts.push(contact.github);
  if (contact.website) parts.push(contact.website);

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm justify-center text-muted-foreground mt-2">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-3">
          <EditableText path={`contact.${Object.keys(contact).find((key) => contact[key as keyof ContactInfo] === p) || ""}`} />
          {i < parts.length - 1 && <span className="text-border text-xs">•</span>}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="uppercase tracking-wider font-semibold mb-3 pb-1">{title}</h2>
      {children}
    </section>
  );
}

function ExperienceBlock({ index }: { index: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <EditableText path={`experience.${index}.company`} as="h3" className="font-bold text-base" />
        <div className="text-sm text-muted-foreground flex gap-1">
          <EditableText path={`experience.${index}.start`} /> - <EditableText path={`experience.${index}.end`} />
        </div>
      </div>
      <div className="flex justify-between items-baseline mb-2">
        <EditableText path={`experience.${index}.title`} className="italic flex-1" />
        <EditableText path={`experience.${index}.location`} className="text-sm text-muted-foreground text-right" />
      </div>
      <BulletList expIdx={index} section="experience" />
    </div>
  );
}

function EducationBlock({ index }: { index: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <EditableText path={`education.${index}.institution`} as="h3" className="font-bold text-base" />
        <div className="text-sm text-muted-foreground flex gap-1">
          <EditableText path={`education.${index}.start`} /> - <EditableText path={`education.${index}.end`} />
        </div>
      </div>
      <div className="mb-1">
        <EditableText path={`education.${index}.degree`} className="inline italic" /> 
        {" in "} 
        <EditableText path={`education.${index}.field`} className="inline" />
      </div>
    </div>
  );
}

function SkillsRow({ index }: { index: number }) {
  return (
    <div className="mb-2 flex items-baseline">
      <EditableText path={`skills.${index}.category`} className="font-semibold w-32 shrink-0 capitalize" />
      <div className="flex-1">
        <EditableText path={`skills.${index}.items.0`} placeholder="Skill 1, Skill 2, etc." />
        {/* In reality, you'd map individual skills or have them as a comma-separated string */}
      </div>
    </div>
  );
}

export function MinimalTemplate() {
  const resume = useResumeStore((s) => s.resume);
  
  if (!resume) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-muted rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="space-y-2 mt-8">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <article className="resume minimal-theme bg-white text-black p-8 sm:p-12 min-h-screen shadow-lg rounded-sm max-w-4xl mx-auto ring-1 ring-border">
      <header className="mb-8 text-center shrink-0">
        <EditableText path="name" as="h1" className="font-heading font-black tracking-tight" />
        <EditableText path="headline" as="p" className="text-muted-foreground text-lg mt-1" />
        <ContactBar contact={resume.contact || ({} as ContactInfo)} />
      </header>

      <div className="space-y-6">
        <Section title="Summary">
          <EditableText path="summary" as="p" className="text-sm leading-relaxed" />
        </Section>

        {resume.experience && resume.experience.length > 0 && (
          <Section title="Experience">
            {resume.experience.map((_, i) => (
              <ExperienceBlock key={i} index={i} />
            ))}
          </Section>
        )}

        {resume.education && resume.education.length > 0 && (
          <Section title="Education">
            {resume.education.map((_, i) => (
              <EducationBlock key={i} index={i} />
            ))}
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
