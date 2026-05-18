import { create } from "zustand";

import type { Resume } from "@/lib/types/resume";

export type UploadMode = "resume-only" | "resume-jd";

export type UploadStatus =
  | "idle"
  | "selecting"
  | "parsing"
  | "parsed"
  | "error";

interface UploadState {
  mode: UploadMode;
  file: File | null;
  jdText: string;
  parsedResume: Partial<Resume> | null;
  parsedResumeId: string | null;
  status: UploadStatus;
  error: string | null;

  setMode: (mode: UploadMode) => void;
  setFile: (file: File | null) => void;
  setJdText: (text: string) => void;
  setParsed: (resume: Partial<Resume>, resumeId: string) => void;
  setStatus: (status: UploadStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  mode: "resume-only",
  file: null,
  jdText: "",
  parsedResume: null,
  parsedResumeId: null,
  status: "idle",
  error: null,

  setMode: (mode) => set({ mode }),
  setFile: (file) => set({ file }),
  setJdText: (jdText) => set({ jdText }),
  setParsed: (resume, resumeId) =>
    set({
      parsedResume: resume,
      parsedResumeId: resumeId,
      status: "parsed",
      error: null,
    }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  reset: () =>
    set({
      mode: "resume-only",
      file: null,
      jdText: "",
      parsedResume: null,
      parsedResumeId: null,
      status: "idle",
      error: null,
    }),
}));
