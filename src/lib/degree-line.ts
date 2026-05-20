function fieldText(value: unknown): string {
  if (value == null) return "";
  const raw = typeof value === "string" ? value : String(value);
  return raw.replace(/<[^>]+>/g, "").trim();
}

export function shouldShowFieldInDegreeLine(
  degree: string,
  field: string | null | undefined,
): boolean {
  const f = fieldText(field);
  if (!f) return false;
  const d = fieldText(degree).toLowerCase();
  const normalized = f.toLowerCase();
  if (d === normalized) return false;
  if (d.endsWith(normalized) || d.includes(` in ${normalized}`)) return false;
  return true;
}

export function formatDegreeLine(
  degree: string | null | undefined,
  field: string | null | undefined,
): string {
  const d = fieldText(degree);
  const f = fieldText(field);
  if (!d && !f) return "";
  if (!f || !shouldShowFieldInDegreeLine(d, f)) return d;
  if (!d) return f;
  return `${d} in ${f}`;
}

export function parseDegreeLine(text: string): { degree: string; field: string } {
  const plain = fieldText(text);
  if (!plain) return { degree: "", field: "" };

  const split = plain.match(/^(.+?)\s+in\s+(.+)$/i);
  if (split) {
    return { degree: split[1].trim(), field: split[2].trim() };
  }

  return { degree: plain, field: "" };
}
