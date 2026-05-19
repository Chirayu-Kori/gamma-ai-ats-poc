import { resolvePageDimensions } from "@/lib/page-size";
import { mergeThemeDefaults } from "@/lib/resume-theme";
import type { ContactInfo, ContactKey } from "@/lib/types/resume";
import { getOrderedContactKeys } from "@/lib/contact-order";

const MM_TO_PT = 2.834645669291339;

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\bShow\s+Publication\b/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
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

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const s = start?.trim() ?? "";
  const e = end?.trim() ?? "";
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

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
