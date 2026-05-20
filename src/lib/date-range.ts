function fieldText(value: unknown): string {
  if (value == null) return "";
  const raw = typeof value === "string" ? value : String(value);
  return raw.replace(/<[^>]+>/g, "").trim();
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const s = fieldText(start);
  const e = fieldText(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

export function parseDateRange(text: string): { start: string; end: string } {
  const plain = fieldText(text);
  if (!plain) return { start: "", end: "" };

  const split = plain.match(/^(.+?)\s*[–—-]\s*(.+)$/);
  if (split) {
    return { start: split[1].trim(), end: split[2].trim() };
  }

  return { start: plain, end: "" };
}
