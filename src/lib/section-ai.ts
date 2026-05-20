import type { Resume, ResumeSectionConfig } from "@/lib/types/resume";
import { certificationsPlainText, hasCertificationsContent } from "@/lib/certifications-content";
import { findSectionIndex } from "@/lib/resume-sections";

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim();
}

/** Compact resume snapshot for AI (matches backend resume_context). */
export function buildResumeContextText(
  resume: Partial<Resume> | null,
  options?: {
    jdText?: string | null;
    editingSectionType?: string;
    editingSectionTitle?: string;
  },
): string {
  if (!resume) return "";

  const editingType = options?.editingSectionType;
  const lines: string[] = [];

  if (resume.name) lines.push(`Name: ${resume.name}`);
  if (resume.headline) lines.push(`Headline: ${stripHtml(resume.headline)}`);

  const contact = resume.contact;
  if (contact) {
    const bits = [
      contact.email,
      contact.phone,
      contact.location,
      contact.linkedin,
      contact.github,
      contact.website,
    ].filter(Boolean);
    if (bits.length) lines.push(`Contact: ${bits.join(", ")}`);
  }

  if (resume.summary && editingType !== "summary") {
    const s = stripHtml(resume.summary);
    if (s) lines.push(`Summary: ${s.slice(0, 800)}`);
  }

  if (resume.experience?.length) {
    lines.push(
      editingType === "experience"
        ? "Experience (for consistency across roles):"
        : "Experience:",
    );
    for (const exp of resume.experience.slice(0, 8)) {
      const title = exp.title?.trim() ?? "";
      const company = exp.company?.trim() ?? "";
      lines.push(
        `  • ${title} at ${company} (${exp.start ?? "?"} – ${exp.end ?? "Present"})`,
      );
      for (const bullet of (exp.bullets ?? []).slice(0, 3)) {
        const bt = stripHtml(bullet.text ?? "");
        if (bt) lines.push(`    - ${bt.slice(0, 200)}`);
      }
    }
  }

  if (resume.education?.length && editingType !== "education") {
    lines.push("Education:");
    for (const edu of resume.education.slice(0, 5)) {
      const line = [edu.degree, edu.field, edu.institution]
        .filter(Boolean)
        .join(" — ");
      if (line) lines.push(`  • ${line}`);
    }
  }

  if (resume.skills?.length && editingType !== "skills") {
    lines.push("Skills:");
    for (const group of resume.skills.slice(0, 6)) {
      const items = (group.items ?? []).join(", ").slice(0, 300);
      if (group.category || items) {
        lines.push(
          group.category ? `  • ${group.category}: ${items}` : `  • ${items}`,
        );
      }
    }
  }

  if (resume.projects?.length && editingType !== "projects") {
    lines.push("Projects:");
    for (const proj of resume.projects.slice(0, 5)) {
      const name = proj.name?.trim();
      if (name) {
        const desc = stripHtml(proj.description ?? "").slice(0, 200);
        lines.push(desc ? `  • ${name}: ${desc}` : `  • ${name}`);
      }
    }
  }

  if (
    hasCertificationsContent(resume.certifications) &&
    editingType !== "certifications"
  ) {
    const text = certificationsPlainText(resume.certifications).slice(0, 500);
    if (text) lines.push(`Certifications: ${text}`);
  }

  if (options?.editingSectionType) {
    lines.push(
      `\n[Currently editing section: ${options.editingSectionTitle ?? options.editingSectionType}]`,
    );
  }

  const jd = options?.jdText?.trim();
  if (jd) {
    lines.push(
      `\nTarget job description (align wording; do not invent experience):\n${jd.slice(0, 6000)}`,
    );
  }

  return lines.join("\n").trim();
}

export type SectionFieldSnapshot = {
  path: string;
  label: string;
  content: string;
};

export type SectionRewriteUpdate = {
  path: string;
  value: unknown;
};

/** Collect editable field paths + content for a resume section. */
export function getSectionFieldSnapshots(
  resume: Partial<Resume> | null,
  section: ResumeSectionConfig,
): SectionFieldSnapshot[] {
  if (!resume) return [];

  const sectionIndex = findSectionIndex(resume, section.id);

  switch (section.type) {
    case "summary":
      return [
        {
          path: "summary",
          label: "Summary",
          content: resume.summary ?? "",
        },
      ];

    case "experience":
      return (resume.experience ?? []).flatMap((exp, i) => {
        const prefix = `Job ${i + 1}`;
        const fields: SectionFieldSnapshot[] = [
          {
            path: `experience.${i}.company`,
            label: `${prefix} company`,
            content: exp.company ?? "",
          },
          {
            path: `experience.${i}.title`,
            label: `${prefix} title`,
            content: exp.title ?? "",
          },
          {
            path: `experience.${i}.start`,
            label: `${prefix} start date`,
            content: exp.start ?? "",
          },
          {
            path: `experience.${i}.end`,
            label: `${prefix} end date`,
            content: exp.end ?? "",
          },
          {
            path: `experience.${i}.location`,
            label: `${prefix} location`,
            content: exp.location ?? "",
          },
        ];
        (exp.bullets ?? []).forEach((bullet, bi) => {
          fields.push({
            path: `experience.${i}.bullets.${bi}.text`,
            label: `${prefix} bullet ${bi + 1}`,
            content: bullet.text ?? "",
          });
        });
        return fields;
      });

    case "education":
      return (resume.education ?? []).flatMap((edu, i) => {
        const prefix = `Education ${i + 1}`;
        const fields: SectionFieldSnapshot[] = [
          {
            path: `education.${i}.institution`,
            label: `${prefix} institution`,
            content: edu.institution ?? "",
          },
          {
            path: `education.${i}.degree`,
            label: `${prefix} degree`,
            content: edu.degree ?? "",
          },
          {
            path: `education.${i}.field`,
            label: `${prefix} field`,
            content: edu.field ?? "",
          },
          {
            path: `education.${i}.start`,
            label: `${prefix} start`,
            content: edu.start ?? "",
          },
          {
            path: `education.${i}.end`,
            label: `${prefix} end`,
            content: edu.end ?? "",
          },
          {
            path: `education.${i}.gpa`,
            label: `${prefix} GPA`,
            content: edu.gpa ?? "",
          },
        ];
        (edu.highlights ?? []).forEach((line, hi) => {
          fields.push({
            path: `education.${i}.highlights.${hi}`,
            label: `${prefix} highlight ${hi + 1}`,
            content: line ?? "",
          });
        });
        return fields;
      });

    case "skills":
      return (resume.skills ?? []).flatMap((group, i) => [
        {
          path: `skills.${i}.category`,
          label: `Skill group ${i + 1} category`,
          content: group.category ?? "",
        },
        {
          path: `skills.${i}.items`,
          label: `Skill group ${i + 1} items`,
          content: (group.items ?? []).join(", "),
        },
      ]);

    case "projects":
      return (resume.projects ?? []).flatMap((project, i) => {
        const prefix = `Project ${i + 1}`;
        const fields: SectionFieldSnapshot[] = [
          {
            path: `projects.${i}.name`,
            label: `${prefix} name`,
            content: project.name ?? "",
          },
          {
            path: `projects.${i}.description`,
            label: `${prefix} description`,
            content: project.description ?? "",
          },
        ];
        (project.bullets ?? []).forEach((bullet, bi) => {
          fields.push({
            path: `projects.${i}.bullets.${bi}.text`,
            label: `${prefix} bullet ${bi + 1}`,
            content: bullet.text ?? "",
          });
        });
        return fields;
      });

    case "certifications":
      return [
        {
          path: "certifications",
          label: "Certifications",
          content: resume.certifications ?? "",
        },
      ];

    case "custom":
      if (sectionIndex < 0) return [];
      return [
        {
          path: `sections.${sectionIndex}.title`,
          label: "Section title",
          content: section.title ?? "",
        },
        {
          path: `sections.${sectionIndex}.custom_content`,
          label: "Section content",
          content: section.custom_content ?? "",
        },
      ];

    default:
      return [];
  }
}

/** Apply API updates to resume store paths. */
export function normalizeSectionUpdates(
  updates: SectionRewriteUpdate[],
): SectionRewriteUpdate[] {
  return updates.map((u) => {
    if (u.path.endsWith(".items") && typeof u.value === "string") {
      const items = u.value
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      return { path: u.path, value: items };
    }
    return u;
  });
}
