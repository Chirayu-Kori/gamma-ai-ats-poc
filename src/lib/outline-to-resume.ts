import type { Resume, Experience, Education, SkillGroup, Bullet } from "@/lib/types/resume";
import type { EditableOutlineBlock } from "@/lib/outline-utils";

const EMPTY_CONTACT: Resume["contact"] = {
  email: null,
  phone: null,
  location: null,
  linkedin: null,
  github: null,
  website: null,
};

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function bulletId(prefix: string, index: number): string {
  return `${prefix}-b${index}`;
}

function toBullets(texts: string[], prefix: string): Bullet[] {
  return texts.map((text, i) => ({
    id: bulletId(prefix, i),
    text,
  }));
}

function isSummarySection(title: string): boolean {
  return /summary|profile|objective|about/.test(normalizeTitle(title));
}

function isExperienceSection(title: string): boolean {
  return (
    /^experience/.test(normalizeTitle(title)) ||
    /work history|employment/.test(normalizeTitle(title))
  );
}

function isEducationSection(title: string): boolean {
  return /education|academic/.test(normalizeTitle(title));
}

function isSkillsSection(title: string): boolean {
  return /skills|technical|competencies|expertise/.test(normalizeTitle(title));
}

function isCertificationsSection(title: string): boolean {
  return /certification|licenses|credentials/.test(normalizeTitle(title));
}

function isProjectsSection(title: string): boolean {
  return /projects|portfolio/.test(normalizeTitle(title));
}

function isLanguagesSection(title: string): boolean {
  return /^languages?$/.test(normalizeTitle(title));
}

function isAwardsSection(title: string): boolean {
  return /awards|recognition|honors/.test(normalizeTitle(title));
}

function parseExperienceBlock(
  block: EditableOutlineBlock,
  index: number,
): Experience {
  const title = block.title.trim();
  const dashMatch = title.match(/^experience\s*[—\-–:]\s*(.+)$/i);
  const company =
    dashMatch?.[1]?.trim() ??
    (title.replace(/^experience\s*/i, "").trim() || "Company");
  
  const bullets = block.bullets ?? [];
  const paragraph = block.paragraph?.trim();

  // If no paragraph but bullets exist, the first bullet might be the title
  let jobTitle = paragraph || "Role Title";
  let remainingBullets = bullets;

  if (!paragraph && bullets.length > 0) {
    // If the first bullet is short (less than 60 chars), use it as the title
    if (bullets[0].length < 60) {
      jobTitle = bullets[0];
      remainingBullets = bullets.slice(1);
    }
  }

  return {
    id: `exp-${index}`,
    company,
    title: jobTitle,
    start: "Jan 2021",
    end: "Present",
    location: "Remote",
    bullets: toBullets(
      remainingBullets.length > 0 
        ? remainingBullets 
        : ["Describe your impact and achievements..."], 
      `exp-${index}`
    ),
  };
}

function parseEducationBullet(bullet: string, index: number): Education {
  const dashParts = bullet.split(/\s*[—\-–]\s*/);
  const commaParts = bullet.split(/,\s*/);

  let degree = bullet;
  let institution = "Institution";
  let end: string | null = null;

  if (dashParts.length >= 2) {
    degree = dashParts[0].trim();
    const rest = dashParts.slice(1).join(" — ");
    const yearMatch = rest.match(/(\d{4})\s*$/);
    institution = yearMatch ? rest.slice(0, yearMatch.index).trim() : rest.trim();
    end = yearMatch?.[1] ?? null;
  } else if (commaParts.length >= 2) {
    degree = commaParts[0].trim();
    institution = commaParts.slice(1, -1).join(", ").trim() || commaParts[1].trim();
    const last = commaParts[commaParts.length - 1];
    end = /^\d{4}$/.test(last.trim()) ? last.trim() : null;
  }

  return {
    id: `edu-${index}`,
    institution,
    degree,
    field: null,
    start: null,
    end,
    gpa: null,
    highlights: [],
  };
}

function parseSkillBullet(bullet: string): SkillGroup {
  const colonIdx = bullet.indexOf(":");
  if (colonIdx > 0) {
    const category = bullet.slice(0, colonIdx).trim();
    const items = bullet
      .slice(colonIdx + 1)
      .split(/,\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      category,
      items: items.length > 0 ? [items.join(", ")] : [bullet],
    };
  }
  return { category: "Skills", items: [bullet] };
}

function parseTitleBlock(block: EditableOutlineBlock): {
  name: string;
  headline: string;
} {
  const title = block.title.trim();
  // Usually "John Doe Resume" or "John Doe - Senior Developer"
  const nameMatch = title.match(/^(.+?)(?:\s+resume|\s*[-—:]|$)/i);
  const name = nameMatch?.[1]?.trim() || "Your Name";
  
  const withoutResume = title.replace(/\s+resume\s*$/i, "").trim();
  const headline =
    block.paragraph?.trim() ||
    withoutResume ||
    "Professional";

  return {
    name,
    headline,
  };
}

function textFromBlock(block: EditableOutlineBlock): string {
  if (block.paragraph?.trim()) return block.paragraph.trim();
  if (block.bullets?.length) return block.bullets.join("\n");
  return block.title.trim();
}

/**
 * Converts AI-generated outline blocks into a structured Resume for the editor template.
 */
export function outlineBlocksToResume(blocks: EditableOutlineBlock[]): Resume {
  const experience: Experience[] = [];
  const education: Education[] = [];
  const skills: SkillGroup[] = [];
  const certifications: string[] = [];
  let summary = "";
  let name = "Your Name";
  let headline = "Professional";
  let titleBlockUsed = false;

  blocks.forEach((block, index) => {
    const title = block.title.trim();
    if (!title && !block.paragraph && !block.bullets?.length) return;

    if (isSummarySection(title)) {
      summary = textFromBlock(block);
      return;
    }

    if (isExperienceSection(title)) {
      experience.push(parseExperienceBlock(block, experience.length));
      return;
    }

    if (isEducationSection(title)) {
      const bullets = block.bullets ?? [];
      if (bullets.length > 0) {
        bullets.forEach((b, i) => education.push(parseEducationBullet(b, education.length + i)));
      } else if (block.paragraph) {
        education.push(parseEducationBullet(block.paragraph, education.length));
      }
      return;
    }

    if (isSkillsSection(title)) {
      const bullets = block.bullets ?? [];
      if (bullets.length > 0) {
        bullets.forEach((b) => skills.push(parseSkillBullet(b)));
      } else if (block.paragraph) {
        skills.push({ category: "Skills", items: [block.paragraph] });
      }
      return;
    }

    if (isCertificationsSection(title)) {
      if (block.paragraph) certifications.push(block.paragraph);
      if (block.bullets?.length) certifications.push(...block.bullets);
      return;
    }

    if (isProjectsSection(title) || isLanguagesSection(title) || isAwardsSection(title)) {
      const bullets = block.bullets ?? [];
      if (bullets.length > 0) {
        bullets.forEach((b) => skills.push(parseSkillBullet(`${title}: ${b}`)));
      } else if (block.paragraph) {
        skills.push({ category: title, items: [block.paragraph] });
      }
      return;
    }

    if (!titleBlockUsed && index === 0) {
      const parsed = parseTitleBlock(block);
      name = parsed.name;
      headline = parsed.headline;
      titleBlockUsed = true;
      return;
    }

    if (block.paragraph && !summary) {
      summary = block.paragraph;
    } else if (block.bullets?.length) {
      skills.push({ category: title || "Additional", items: block.bullets });
    }
  });

  if (!summary && blocks.length > 1) {
    const summaryBlock = blocks.find((b) => isSummarySection(b.title));
    if (summaryBlock) summary = textFromBlock(summaryBlock);
  }

  return {
    name,
    headline,
    contact: { ...EMPTY_CONTACT },
    summary: summary || "Add a professional summary that highlights your strengths and career goals.",
    experience:
      experience.length > 0
        ? experience
        : [
            {
              id: "exp-0",
              company: "Company Name",
              title: "Job Title",
              start: "Start Date",
              end: "Present",
              location: null,
              bullets: toBullets(["Describe your key achievements and metrics..."], "exp-0"),
            },
          ],
    education:
      education.length > 0
        ? education
        : [
            {
              id: "edu-0",
              institution: "University Name",
              degree: "Degree",
              field: null,
              start: null,
              end: "Graduation Year",
              gpa: null,
              highlights: [],
            },
          ],
    skills:
      skills.length > 0
        ? skills
        : [{ category: "Skills", items: ["Add your skills here"] }],
    projects: null,
    certifications: certifications.length > 0 ? certifications : null,
  };
}
