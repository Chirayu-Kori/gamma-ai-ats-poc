import { Text, View } from "@react-pdf/renderer";

import type {
  Education,
  Experience,
  Project,
  Resume,
  ResumeSectionConfig,
  ResumeSectionType,
  SkillGroup,
} from "@/lib/types/resume";

import type { PdfStyles } from "./create-pdf-styles";
import { getPdfSections } from "./section-utils";
import {
  formatDateRange,
  joinParts,
  splitParagraphs,
  stripHtmlToText,
} from "./pdf-utils";

export function PdfSectionsList({
  resume,
  styles,
  excludeTypes,
  includeTypes,
  compactTitles = false,
}: {
  resume: Partial<Resume>;
  styles: PdfStyles;
  excludeTypes?: ResumeSectionType[];
  includeTypes?: ResumeSectionType[];
  compactTitles?: boolean;
}) {
  const sections = getPdfSections(resume, { excludeTypes, includeTypes });
  return (
    <>
      {sections.map((section) => (
        <PdfSection
          key={section.id}
          section={section}
          resume={resume}
          styles={styles}
          compactTitle={compactTitles}
        />
      ))}
    </>
  );
}

export function PdfSection({
  section,
  resume,
  styles,
  compactTitle = false,
}: {
  section: ResumeSectionConfig;
  resume: Partial<Resume>;
  styles: PdfStyles;
  compactTitle?: boolean;
}) {
  const title = section.title?.trim();
  const content = renderSectionContent(section, resume, styles);
  if (!content) return null;

  const titleTextStyle = compactTitle
    ? styles.sectionTitleCompact
    : styles.sectionTitleText;

  return (
    <View style={styles.section} wrap>
      {title ? (
        <View style={styles.sectionTitleWrap}>
          <Text style={titleTextStyle}>{title}</Text>
          <View style={styles.sectionTitleRule} />
        </View>
      ) : null}
      <View>{content}</View>
    </View>
  );
}

function PdfParagraphs({ text, styles }: { text: string; styles: PdfStyles }) {
  const paragraphs = splitParagraphs(stripHtmlToText(text));
  if (!paragraphs.length) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={`p-${index}`}
          style={index === 0 ? styles.bodyText : styles.bodyTextSpaced}
        >
          {paragraph}
        </Text>
      ))}
    </>
  );
}

function PdfRow({
  left,
  right,
  styles,
  variant = "title",
}: {
  left: string;
  right?: string;
  styles: PdfStyles;
  variant?: "title" | "subtitle";
}) {
  const leftStyle =
    variant === "subtitle" ? styles.rowSubtitle : styles.rowTitle;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={leftStyle}>{left}</Text>
      </View>
      {right ? (
        <View style={styles.rowRight}>
          <Text style={styles.rowMeta}>{right}</Text>
        </View>
      ) : null}
    </View>
  );
}

function renderSectionContent(
  section: ResumeSectionConfig,
  resume: Partial<Resume>,
  styles: PdfStyles,
) {
  switch (section.type) {
    case "summary":
      return resume.summary?.trim() ? (
        <PdfParagraphs text={resume.summary} styles={styles} />
      ) : null;
    case "experience":
      return (resume.experience ?? []).map((exp, i) => (
        <ExperienceBlock key={exp.id ?? `exp-${i}`} exp={exp} styles={styles} />
      ));
    case "education":
      return (resume.education ?? []).map((edu, i) => (
        <EducationBlock key={edu.id ?? `edu-${i}`} edu={edu} styles={styles} />
      ));
    case "skills":
      return (resume.skills ?? []).map((group, i) => (
        <SkillGroupBlock key={group.id ?? `skill-${i}`} group={group} styles={styles} />
      ));
    case "projects":
      return (resume.projects ?? []).map((project, i) => (
        <ProjectBlock key={project.id ?? `proj-${i}`} project={project} styles={styles} />
      ));
    case "certifications":
      return (resume.certifications ?? [])
        .filter((c) => c?.trim())
        .map((cert, i) => (
          <View key={`cert-${i}`} style={styles.subsection}>
            <Text style={styles.bullet}>• {cert.trim()}</Text>
          </View>
        ));
    case "custom": {
      const text = section.custom_content ?? "";
      return text ? <PdfParagraphs text={text} styles={styles} /> : null;
    }
    default:
      return null;
  }
}

function ExperienceBlock({ exp, styles }: { exp: Experience; styles: PdfStyles }) {
  const dates = formatDateRange(exp.start, exp.end);
  const location = exp.location?.trim();

  return (
    <View style={styles.subsection} wrap={false}>
      <PdfRow left={exp.company || "Company"} right={dates} styles={styles} />
      {exp.title?.trim() || location ? (
        <PdfRow
          left={exp.title?.trim() || "Role"}
          right={location}
          styles={styles}
          variant="subtitle"
        />
      ) : null}
      {(exp.bullets ?? []).map((bullet, i) =>
        bullet.text?.trim() ? (
          <Text key={bullet.id ?? `b-${i}`} style={styles.bullet}>
            • {bullet.text.trim()}
          </Text>
        ) : null,
      )}
    </View>
  );
}

function EducationBlock({ edu, styles }: { edu: Education; styles: PdfStyles }) {
  const dates = formatDateRange(edu.start, edu.end);
  const degreeLine = joinParts([edu.degree, edu.field], ", ");

  return (
    <View style={styles.subsection} wrap={false}>
      <PdfRow left={edu.institution || "Institution"} right={dates} styles={styles} />
      {degreeLine ? <Text style={styles.rowSubtitle}>{degreeLine}</Text> : null}
      {edu.gpa?.trim() ? (
        <Text style={styles.bodyText}>GPA: {edu.gpa.trim()}</Text>
      ) : null}
      {(edu.highlights ?? []).map((line, i) =>
        line?.trim() ? (
          <Text key={`h-${i}`} style={styles.bullet}>
            • {line.trim()}
          </Text>
        ) : null,
      )}
    </View>
  );
}

function SkillGroupBlock({ group, styles }: { group: SkillGroup; styles: PdfStyles }) {
  const items = (group.items ?? []).filter((item) => item?.trim());
  if (!group.category?.trim() && !items.length) return null;

  return (
    <View style={styles.subsection} wrap={false}>
      {group.category?.trim() ? (
        <Text style={styles.skillCategory}>{group.category.trim()}</Text>
      ) : null}
      {items.length ? (
        <Text style={styles.skillItems}>{items.join(", ")}</Text>
      ) : null}
    </View>
  );
}

function ProjectBlock({ project, styles }: { project: Project; styles: PdfStyles }) {
  const tech = (project.tech_stack ?? []).filter(Boolean).join(", ");

  return (
    <View style={styles.subsection} wrap={false}>
      <Text style={styles.blockTitle}>{project.name || "Project"}</Text>
      {project.description?.trim() ? (
        <PdfParagraphs text={project.description} styles={styles} />
      ) : null}
      {tech ? <Text style={styles.rowSubtitle}>{tech}</Text> : null}
      {project.url?.trim() ? (
        <Text style={styles.bodyText}>{project.url.trim()}</Text>
      ) : null}
      {(project.bullets ?? []).map((bullet, i) =>
        bullet.text?.trim() ? (
          <Text key={bullet.id ?? `pb-${i}`} style={styles.bullet}>
            • {bullet.text.trim()}
          </Text>
        ) : null,
      )}
    </View>
  );
}
