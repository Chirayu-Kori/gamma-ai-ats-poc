import { stripHtmlToText } from "@/pdf/pdf-utils";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalize legacy string[] certifications into rich-text HTML. */
export function normalizeCertificationsField(
  value: string | string[] | null | undefined,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    if (!items.length) return "";
    return `<ul>${items.map((item) => `<li><p>${escapeHtml(item)}</p></li>`).join("")}</ul>`;
  }
  return "";
}

export function hasCertificationsContent(
  value: string | string[] | null | undefined,
): boolean {
  return Boolean(stripHtmlToText(normalizeCertificationsField(value)).trim());
}

export function certificationsPlainText(
  value: string | string[] | null | undefined,
): string {
  return stripHtmlToText(normalizeCertificationsField(value)).trim();
}
