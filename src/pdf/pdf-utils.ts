import { resolvePageDimensions } from "@/lib/page-size";
import { mergeThemeDefaults } from "@/lib/resume-theme";
import type { ContactInfo, ContactKey } from "@/lib/types/resume";
import { getOrderedContactKeys } from "@/lib/contact-order";

const MM_TO_PT = 2.834645669291339;

function parseHexColor(hex: string): [number, number, number] | null {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(normalized)) return null;
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

/** Approximate CSS color-mix(in srgb, accent N%, white) for PDF fills. */
export function mixAccentColor(accent: string, accentWeight = 0.12): string {
  const rgb = parseHexColor(accent);
  if (!rgb) return "#f8fafc";
  const mix = (channel: number) =>
    Math.round(channel * accentWeight + 255 * (1 - accentWeight));
  return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
}

export function mixAccentBorder(accent: string, accentWeight = 0.22): string {
  const rgb = parseHexColor(accent);
  if (!rgb) return "#e2e8f0";
  const mix = (channel: number) =>
    Math.round(channel * accentWeight + 255 * (1 - accentWeight));
  return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
}

export type RichTextBlock =
  | { type: "paragraph"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "orderedList"; items: string[] };

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** Strip inline HTML tags while preserving basic line breaks. */
export function stripInlineHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " "),
  ).trim();
}

export function stripHtmlToText(html: string): string {
  return stripInlineHtml(
    html
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n"),
  )
    .replace(/\bShow\s+Publication\b/gi, "")
    .replace(/\n{3,}/g, "\n\n");
}

function parseListItems(listInner: string): string[] {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRegex.exec(listInner))) {
    const text = stripInlineHtml(match[1] ?? "");
    if (text) items.push(text);
  }

  return items;
}

/** Parse TipTap block HTML into structured PDF blocks. */
export function parseRichTextBlocks(html: string): RichTextBlock[] {
  const source = html?.trim();
  if (!source) return [];

  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return splitParagraphs(source).map((text) => ({
      type: "paragraph",
      text,
    }));
  }

  const blocks: RichTextBlock[] = [];
  let remaining = source;

  while (remaining.length > 0) {
    remaining = remaining.trimStart();
    if (!remaining) break;

    const ulMatch = remaining.match(/^<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      const items = parseListItems(ulMatch[1] ?? "");
      if (items.length) blocks.push({ type: "bulletList", items });
      remaining = remaining.slice(ulMatch[0].length);
      continue;
    }

    const olMatch = remaining.match(/^<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olMatch) {
      const items = parseListItems(olMatch[1] ?? "");
      if (items.length) blocks.push({ type: "orderedList", items });
      remaining = remaining.slice(olMatch[0].length);
      continue;
    }

    const pMatch = remaining.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      const text = stripInlineHtml(pMatch[1] ?? "");
      if (text) blocks.push({ type: "paragraph", text });
      remaining = remaining.slice(pMatch[0].length);
      continue;
    }

    const nextTag = remaining.search(/<[^>]+>/);
    if (nextTag === -1) {
      const text = stripInlineHtml(remaining);
      if (text) blocks.push({ type: "paragraph", text });
      break;
    }

    if (nextTag > 0) {
      const text = stripInlineHtml(remaining.slice(0, nextTag));
      if (text) blocks.push({ type: "paragraph", text });
      remaining = remaining.slice(nextTag);
      continue;
    }

    const closeIdx = remaining.indexOf(">");
    remaining = closeIdx === -1 ? "" : remaining.slice(closeIdx + 1);
  }

  return blocks;
}

/** Preserve intentional line breaks from rich-text header fields in PDF output. */
export function formatPdfInlineText(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) return "";
  return stripHtmlToText(raw);
}

/** Split prose into blocks for separate PDF Text nodes (avoids overlap). */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function getPageSizePt(theme: Record<string, string>): [number, number] {
  const dims = resolvePageDimensions(mergeThemeDefaults(theme));
  const toPt = (value: number) =>
    dims.unit === "mm" ? value * MM_TO_PT : value * 72;
  return [toPt(dims.width), toPt(dims.height)];
}

/** Map web font stacks to PDF built-in fonts (no external font files). */
export function mapPdfFontFamily(fontFamily: string): string {
  const lower = fontFamily.toLowerCase();
  if (
    lower.includes("merriweather") ||
    lower.includes("playfair") ||
    lower.includes("georgia") ||
    (lower.includes("serif") && !lower.includes("sans"))
  ) {
    return "Times-Roman";
  }
  if (lower.includes("courier") || lower.includes("mono")) {
    return "Courier";
  }
  return "Helvetica";
}

export { formatDateRange } from "@/lib/date-range";

export function buildContactLine(
  contact: ContactInfo,
  order: ContactKey[] | null | undefined,
): string {
  const keys = getOrderedContactKeys(contact, order);
  return keys
    .map((key) => contact[key]?.trim())
    .filter(Boolean)
    .join("  •  ");
}

export function joinParts(parts: (string | null | undefined)[], sep = " · "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}
