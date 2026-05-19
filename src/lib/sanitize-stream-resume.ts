import type { Resume } from "@/lib/types/resume";

const MAX_FIELD_CHARS = 600;

function clampText(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length <= MAX_FIELD_CHARS) return value;
  return value.slice(0, MAX_FIELD_CHARS) + "…";
}

/** Keep partial resume objects safe to render while JSON is still streaming. */
export function sanitizeStreamResume(
  resume: Partial<Resume>,
): Partial<Resume> {
  const out: Partial<Resume> = { ...resume };

  out.name = clampText(out.name) as string | undefined;
  out.headline = clampText(out.headline) as string | undefined;
  out.summary = clampText(out.summary) as string | undefined;

  if (out.contact && typeof out.contact === "object") {
    const contact = out.contact;
    out.contact = {
      ...contact,
      email: (clampText(contact.email) as string | null | undefined) ?? null,
      phone: (clampText(contact.phone) as string | null | undefined) ?? null,
      location: (clampText(contact.location) as string | null | undefined) ?? null,
      linkedin: (clampText(contact.linkedin) as string | null | undefined) ?? null,
      github: (clampText(contact.github) as string | null | undefined) ?? null,
      website: (clampText(contact.website) as string | null | undefined) ?? null,
    };
  }

  return out;
}
