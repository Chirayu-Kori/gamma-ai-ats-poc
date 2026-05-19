import { parse } from "partial-json";

import type { Resume } from "@/lib/types/resume";

/** Parse streamed resume JSON; fall back to partial-json when truncated. */
export function parseStreamResumeBuffer(raw: string): Partial<Resume> {
  const text = raw.trim();
  if (!text) {
    throw new Error("Generate finished with an empty response");
  }

  try {
    return JSON.parse(text) as Partial<Resume>;
  } catch {
    const partial = parse(text) as Partial<Resume>;
    if (!partial || typeof partial !== "object") {
      throw new Error("Generate returned invalid JSON");
    }
    return partial;
  }
}
