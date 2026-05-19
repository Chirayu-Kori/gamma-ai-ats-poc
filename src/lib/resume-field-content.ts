/** True when a resume field has visible text (ignores empty HTML from TipTap). */
export function fieldHasContent(value: unknown): boolean {
  if (value == null) return false;
  const text = typeof value === "string" ? value : String(value);
  return text.replace(/<[^>]+>/g, "").trim().length > 0;
}
