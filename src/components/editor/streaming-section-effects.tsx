"use client";

import { useEffect } from "react";

import {
  applyStreamingSectionHighlight,
  clearStreamingSectionHighlights,
} from "@/lib/streaming-section-ui";
import { useResumeStore } from "@/stores/resumeStore";

/**
 * Scrolls to and highlights the resume section currently receiving stream updates.
 * Mount once inside the resume canvas (works for headline + dynamic sections).
 */
export function StreamingSectionEffects() {
  const status = useResumeStore((s) => s.status);
  const streamingSectionTarget = useResumeStore((s) => s.streamingSectionTarget);

  useEffect(() => {
    if (status !== "streaming" || !streamingSectionTarget) {
      clearStreamingSectionHighlights();
      return;
    }

    applyStreamingSectionHighlight(streamingSectionTarget);

    return () => {
      clearStreamingSectionHighlights();
    };
  }, [status, streamingSectionTarget]);

  return null;
}
