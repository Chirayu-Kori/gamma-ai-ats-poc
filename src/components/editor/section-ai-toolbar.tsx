"use client";

import type { ResumeSectionConfig } from "@/lib/types/resume";
import { SectionAIPanel } from "./section-ai-panel";

/** Inline section AI bar (legacy); prefer grip menu via SortableCard + SectionAIPanel. */
export function SectionAIToolbar({
  section,
  onClose,
  className,
}: {
  section: ResumeSectionConfig;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <SectionAIPanel section={section} onDone={onClose} className={className} />
  );
}
