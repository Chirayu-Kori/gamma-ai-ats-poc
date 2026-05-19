import type { Resume } from "@/lib/types/resume";

export type ResumePdfProps = {
  resume: Partial<Resume>;
  theme: Record<string, string>;
  templateId: string;
};
