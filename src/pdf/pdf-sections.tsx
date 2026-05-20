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

import {
  hasCertificationsContent,
  normalizeCertificationsField,
} from "@/lib/certifications-content";

import type { PdfStyles } from "./create-pdf-styles";
import { formatDegreeLine } from "@/lib/degree-line";
import { getPdfSections } from "./section-utils";
import { PdfRichText } from "./pdf-rich-text";
import {
  formatDateRange,
  stripInlineHtml,
} from "./pdf-utils";

export function PdfSectionsList({
  resume,
  styles,
  excludeTypes,
  includeTypes,
  compactTitles = false,
  skillsPills = false,
}: {
  resume: Partial<Resume>;
  styles: PdfStyles;
  excludeTypes?: ResumeSectionType[];
  includeTypes?: ResumeSectionType[];
  compactTitles?: boolean;
  skillsPills?: boolean;
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
          skillsPills={skillsPills}
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
  skillsPills = false,
  sidebarAside = false,
}: {
  section: ResumeSectionConfig;
  resume: Partial<Resume>;
  styles: PdfStyles;
  compactTitle?: boolean;
  skillsPills?: boolean;
  sidebarAside?: boolean;
}) {
  const title = section.title?.trim();
  const content = renderSectionContent(section, resume, styles, {
    skillsStacked: compactTitle && !skillsPills,
    skillsPills,
  });
  if (!content) return null;

  const titleTextStyle = sidebarAside
    ? styles.creativeSidebarSectionTitle
    : compactTitle
      ? styles.sectionTitleCompact
      : styles.sectionTitleText;

  const sectionStyle = sidebarAside
    ? styles.sectionSidebarInner
    : compactTitle
      ? styles.sectionCompact
      : styles.section;

  return (
    <View style={sectionStyle} wrap>
      {title ? (
        sidebarAside ? (
          <Text style={titleTextStyle}>{title}</Text>
        ) : (
          <View style={styles.sectionTitleWrap}>
            <Text style={titleTextStyle}>{title}</Text>
            <View style={styles.sectionTitleRule} />
          </View>
        )
      ) : null}
      <View wrap>{content}</View>
    </View>
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
  options?: { skillsStacked?: boolean; skillsPills?: boolean },
) {
  switch (section.type) {
    case "summary":
      return resume.summary?.trim() ? (
        <PdfRichText html={resume.summary} styles={styles} />
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
        <SkillGroupBlock
          key={group.id ?? `skill-${i}`}
          group={group}
          styles={styles}
          stacked={options?.skillsStacked}
          pills={options?.skillsPills}
        />
      ));
    case "projects":
      return (resume.projects ?? []).map((project, i) => (
        <ProjectBlock key={project.id ?? `proj-${i}`} project={project} styles={styles} />
      ));
    case "certifications":
      return hasCertificationsContent(resume.certifications)
        ? (
            <PdfRichText
              html={normalizeCertificationsField(resume.certifications)}
              styles={styles}
            />
          )
        : null;
    case "custom": {
      const text = section.custom_content ?? "";
      return text ? <PdfRichText html={text} styles={styles} /> : null;
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
      <PdfRow
        left={stripInlineHtml(exp.company || "Company")}
        right={dates}
        styles={styles}
      />
      {exp.title?.trim() || location ? (
        <PdfRow
          left={stripInlineHtml(exp.title?.trim() || "Role")}
          right={location ? stripInlineHtml(location) : undefined}
          styles={styles}
          variant="subtitle"
        />
      ) : null}
      {(exp.bullets ?? []).map((bullet, i) => {
        const text = stripInlineHtml(bullet.text ?? "");
        return text ? (
          <Text key={bullet.id ?? `b-${i}`} style={styles.bullet}>
            {exp.bulletsStyle === "ordered" ? `${i + 1}.` : "•"} {text}
          </Text>
        ) : null;
      })}
    </View>
  );
}

function EducationBlock({ edu, styles }: { edu: Education; styles: PdfStyles }) {
  const dates = formatDateRange(edu.start, edu.end);
  const degreeLine = formatDegreeLine(edu.degree, edu.field);

  return (
    <View style={styles.subsection} wrap={false}>
      <PdfRow
        left={stripInlineHtml(edu.institution || "Institution")}
        right={dates}
        styles={styles}
      />
      {degreeLine ? (
        <Text style={styles.rowSubtitle}>{stripInlineHtml(degreeLine)}</Text>
      ) : null}
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

function SkillGroupBlock({
  group,
  styles,
  stacked = false,
  pills = false,
}: {
  group: SkillGroup;
  styles: PdfStyles;
  stacked?: boolean;
  pills?: boolean;
}) {
  const category = stripInlineHtml(group.category ?? "").trim();
  const items = (group.items ?? [])
    .map((item) => stripInlineHtml(item).trim())
    .filter(Boolean);

  if (!category && !items.length) return null;

  if (pills) {
    return (
      <View style={styles.skillPillGroup}>
        {category ? (
          <Text style={styles.skillPillCategory}>{category}</Text>
        ) : null}
        {items.length ? (
          <View style={styles.skillPillWrap}>
            {items.map((item, i) => (
              <View key={`pill-${i}`} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  if (stacked) {
    return (
      <View style={styles.skillGroupStacked} wrap={false}>
        {category ? (
          <Text style={styles.skillCategory}>{category}</Text>
        ) : null}
        {items.length ? (
          <Text style={styles.skillItems}>{items.join(", ")}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.skillRow} wrap={false}>
      {category ? (
        <View style={styles.skillRowCategory}>
          <Text style={styles.skillCategoryRow}>{category}</Text>
        </View>
      ) : null}
      {items.length ? (
        <View style={styles.skillRowItems}>
          <Text style={styles.skillItemsRow}>{items.join(", ")}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ProjectBlock({ project, styles }: { project: Project; styles: PdfStyles }) {
  const tech = (project.tech_stack ?? []).filter(Boolean).join(", ");

  return (
    <View style={styles.subsection} wrap={false}>
      <Text style={styles.blockTitle}>
        {stripInlineHtml(project.name || "Project")}
      </Text>
      {project.description?.trim() ? (
        <PdfRichText html={project.description} styles={styles} />
      ) : null}
      {tech ? <Text style={styles.rowSubtitle}>{tech}</Text> : null}
      {project.url?.trim() ? (
        <Text style={styles.bodyText}>{project.url.trim()}</Text>
      ) : null}
      {(project.bullets ?? []).map((bullet, i) => {
        const text = stripInlineHtml(bullet.text ?? "");
        return text ? (
          <Text key={bullet.id ?? `pb-${i}`} style={styles.bullet}>
            {project.bulletsStyle === "ordered" ? `${i + 1}.` : "•"} {text}
          </Text>
        ) : null;
      })}
    </View>
  );
}
