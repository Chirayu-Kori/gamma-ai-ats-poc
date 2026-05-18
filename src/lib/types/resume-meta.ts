export type ResumeMeta = {
  id: string;
  label: string;
  template_id?: string;
  updated_at?: string;
};

export type ResumeRecord = ResumeMeta & {
  resume: import("./resume").Resume;
  original_resume?: import("./resume").Resume | null;
  theme: Record<string, string>;
  source_text?: string | null;
  jd_text?: string | null;
  created_at: string;
  updated_at: string;
};
