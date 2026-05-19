"use client";

import { resumeThemeToCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { EditableText } from "@/components/editor/EditableText";
import { SortableExperienceList } from "@/components/editor/sortable-experience-list";
import { SortableEducationList } from "@/components/editor/sortable-education-list";
import { SkillsRow } from "@/components/editor/skills-row";
import type { ContactInfo } from "@/lib/types/resume";
import "./modern-theme.css";

function SidebarContactItem({
  label,
  value,
  path,
}: {
  label: string;
  value: string | null | undefined;
  path: string;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] tracking-wider opacity-70 uppercase">
        {label}
      </div>
      <EditableText
        path={path}
        mode="inline"
        className="block text-sm break-words"
      />
    </div>
  );
}

export function ModernTemplate() {
  const resume = useResumeStore((s) => s.resume);
  const theme = useResumeStore((s) => s.theme);

  if (!resume) return null;
  const contact = (resume.contact ?? {}) as ContactInfo;

  return (
    <article
      className="resume modern-theme resume-theme-base ring-border mx-auto grid w-full max-w-5xl min-w-0 grid-cols-[260px_1fr] overflow-hidden rounded-sm shadow-lg ring-1"
      style={resumeThemeToCssVars(theme)}
    >
      <aside className="modern-sidebar space-y-7 p-6">
        <div>
          <EditableText
            path="name"
            mode="inline"
            className="block text-2xl leading-tight font-black"
          />
          <EditableText
            path="headline"
            mode="inline"
            className="mt-1 block text-sm opacity-85"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase">
            Contact
          </h2>
          <SidebarContactItem
            label="Email"
            value={contact.email}
            path="contact.email"
          />
          <SidebarContactItem
            label="Phone"
            value={contact.phone}
            path="contact.phone"
          />
          <SidebarContactItem
            label="Location"
            value={contact.location}
            path="contact.location"
          />
          <SidebarContactItem
            label="LinkedIn"
            value={contact.linkedin}
            path="contact.linkedin"
          />
          <SidebarContactItem
            label="GitHub"
            value={contact.github}
            path="contact.github"
          />
          <SidebarContactItem
            label="Website"
            value={contact.website}
            path="contact.website"
          />
        </div>

        {resume.skills && resume.skills.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wider uppercase">
              Skills
            </h2>
            <div className="space-y-2 text-sm">
              {resume.skills.map((g, i) => (
                <div key={i}>
                  <div className="text-[10px] tracking-wider opacity-70 uppercase">
                    {g.category}
                  </div>
                  <div>{g.items.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="modern-main space-y-7 p-8">
        <section>
          <h2 className="mb-2 text-sm font-bold tracking-wider uppercase">
            Summary
          </h2>
          <EditableText
            path="summary"
            mode="block"
            className="text-sm leading-relaxed text-slate-700"
          />
        </section>

        {resume.experience && resume.experience.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold tracking-wider uppercase">
              Experience
            </h2>
            <SortableExperienceList />
          </section>
        )}

        {resume.education && resume.education.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold tracking-wider uppercase">
              Education
            </h2>
            <SortableEducationList />
          </section>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold tracking-wider uppercase">
              Certifications
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
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
