"use client";

import { useResumePersistence } from "./useResumePersistence";

/** Debounced PUT of resume + theme + template (800ms default). */
export function useDebouncedAutosave(delay = 800) {
  const { triggerAutosave } = useResumePersistence(delay);
  return triggerAutosave;
}
