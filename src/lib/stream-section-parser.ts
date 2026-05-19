import { parse } from "partial-json";

import { createId } from "./ensure-resume-ids";
import type { Bullet, ResumeSectionType } from "./types/resume";

/** DOM / UI target for the section currently being streamed. */
export type StreamSectionTarget = "headline" | ResumeSectionType;

export type SectionKind = "headline" | "summary" | "experience" | "project";

export type SectionStreamContext = {
  sectionId: string;
  kind: SectionKind;
  index?: number;
};

export type StreamFieldUpdate = {
  path: string;
  value: unknown;
};

export function parseSectionId(sectionId: string): SectionStreamContext {
  if (sectionId === "headline") {
    return { sectionId, kind: "headline" };
  }
  if (sectionId === "summary") {
    return { sectionId, kind: "summary" };
  }
  const expMatch = sectionId.match(/^experience-(\d+)$/);
  if (expMatch) {
    return {
      sectionId,
      kind: "experience",
      index: Number(expMatch[1]),
    };
  }
  const projMatch = sectionId.match(/^project-(\d+)$/);
  if (projMatch) {
    return {
      sectionId,
      kind: "project",
      index: Number(projMatch[1]),
    };
  }
  return { sectionId, kind: "summary" };
}

function readPartialObject(buffer: string): Record<string, unknown> | null {
  const text = buffer.trim();
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    try {
      const partial = parse(text) as Record<string, unknown>;
      return partial && typeof partial === "object" ? partial : null;
    } catch {
      return null;
    }
  }
}

/** Regex fallback when partial-json cannot parse yet (mid-string). */
function extractInProgressString(
  buffer: string,
  key: string,
): string | null {
  const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)`);
  const match = buffer.match(pattern);
  if (!match) return null;
  return decodeJsonStringFragment(match[1]);
}

function decodeJsonStringFragment(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
}

/** All bullet texts in the JSON buffer, including the in-progress last string. */
function extractInProgressBullets(
  buffer: string,
): Array<{ text: string }> | null {
  const bullets: Array<{ text: string }> = [];
  // No closing quote required — streams token-by-token inside the value.
  const pattern = /"text"\s*:\s*"((?:\\.|[^"\\])*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(buffer)) !== null) {
    bullets.push({ text: decodeJsonStringFragment(match[1]) });
  }
  return bullets.length ? bullets : null;
}

export function extractStreamUpdates(
  buffer: string,
  ctx: SectionStreamContext,
): StreamFieldUpdate[] {
  const data = readPartialObject(buffer);
  const updates: StreamFieldUpdate[] = [];

  if (ctx.kind === "headline") {
    const headline =
      extractInProgressString(buffer, "headline") ??
      (typeof data?.headline === "string" ? data.headline : null);
    if (headline !== null) {
      updates.push({ path: "headline", value: headline });
    }
    return updates;
  }

  if (ctx.kind === "summary") {
    const summary =
      extractInProgressString(buffer, "summary") ??
      (typeof data?.summary === "string" ? data.summary : null);
    if (summary !== null) {
      updates.push({ path: "summary", value: summary });
    }
    return updates;
  }

  if (ctx.kind === "experience" && ctx.index !== undefined) {
    const idx = ctx.index;
    const bullets =
      extractInProgressBullets(buffer) ??
      (Array.isArray(data?.bullets)
        ? (data.bullets as Array<{ text?: string }>)
        : null);

    if (bullets) {
      bullets.forEach((bullet, bi) => {
        if (typeof bullet.text === "string") {
          updates.push({
            path: `experience.${idx}.bullets.${bi}.text`,
            value: bullet.text,
          });
        }
      });
    }
    return updates;
  }

  if (ctx.kind === "project" && ctx.index !== undefined) {
    const idx = ctx.index;
    const description =
      extractInProgressString(buffer, "description") ??
      (typeof data?.description === "string" ? data.description : null);
    if (description !== null) {
      updates.push({
        path: `projects.${idx}.description`,
        value: description,
      });
    }

    const bullets =
      extractInProgressBullets(buffer) ??
      (Array.isArray(data?.bullets)
        ? (data.bullets as Array<{ text?: string }>)
        : null);

    if (bullets) {
      bullets.forEach((bullet, bi) => {
        if (typeof bullet.text === "string") {
          updates.push({
            path: `projects.${idx}.bullets.${bi}.text`,
            value: bullet.text,
          });
        }
      });
    }
  }

  return updates;
}

export function buildFinalSectionUpdates(
  buffer: string,
  ctx: SectionStreamContext,
): StreamFieldUpdate[] {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(buffer.trim()) as Record<string, unknown>;
  } catch {
    return extractStreamUpdates(buffer, ctx);
  }

  const updates: StreamFieldUpdate[] = [];

  if (ctx.kind === "headline" && typeof data.headline === "string") {
    updates.push({ path: "headline", value: data.headline.trim() });
  }

  if (ctx.kind === "summary" && typeof data.summary === "string") {
    updates.push({ path: "summary", value: data.summary.trim() });
  }

  if (ctx.kind === "experience" && ctx.index !== undefined) {
    const idx = ctx.index;
    const raw = data.bullets as Array<{ text?: string }> | undefined;
    if (Array.isArray(raw)) {
      const bullets: Bullet[] = raw
        .map((b) => ({ id: createId("bullet"), text: (b.text ?? "").trim() }))
        .filter((b) => b.text);
      updates.push({ path: `experience.${idx}.bullets`, value: bullets });
    }
  }

  if (ctx.kind === "project" && ctx.index !== undefined) {
    const idx = ctx.index;
    if (typeof data.description === "string") {
      updates.push({
        path: `projects.${idx}.description`,
        value: data.description.trim(),
      });
    }
    const raw = data.bullets as Array<{ text?: string }> | undefined;
    if (Array.isArray(raw)) {
      const bullets: Bullet[] = raw
        .map((b) => ({ id: createId("bullet"), text: (b.text ?? "").trim() }))
        .filter((b) => b.text);
      updates.push({ path: `projects.${idx}.bullets`, value: bullets });
    }
  }

  return updates;
}

export function streamSectionTargetForContext(
  ctx: SectionStreamContext,
): StreamSectionTarget | null {
  if (ctx.kind === "headline") return "headline";
  if (ctx.kind === "summary") return "summary";
  if (ctx.kind === "experience") return "experience";
  if (ctx.kind === "project") return "projects";
  return null;
}

export function streamSectionTargetForId(
  sectionId: string,
): StreamSectionTarget | null {
  return streamSectionTargetForContext(parseSectionId(sectionId));
}

export function streamPathForContext(ctx: SectionStreamContext): string | null {
  if (ctx.kind === "headline") return "headline";
  if (ctx.kind === "summary") return "summary";
  if (ctx.kind === "experience" && ctx.index !== undefined) {
    return `experience.${ctx.index}.bullets.0.text`;
  }
  if (ctx.kind === "project" && ctx.index !== undefined) {
    return `projects.${ctx.index}.description`;
  }
  return null;
}
