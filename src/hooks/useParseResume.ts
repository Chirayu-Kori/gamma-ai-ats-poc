"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { Resume } from "@/lib/types/resume";

export type ParseResponse = {
  id: string;
  label: string;
  resume: Resume;
  jd_text: string | null;
};

export type ParseInput = {
  file: File;
  jdText?: string;
  label?: string;
};

export function useParseResume() {
  return useMutation({
    mutationKey: ["resumes", "parse"],
    mutationFn: async ({ file, jdText, label }: ParseInput) => {
      const form = new FormData();
      form.append("file", file);
      if (jdText && jdText.trim()) form.append("jd_text", jdText.trim());
      if (label) form.append("label", label);
      const { data } = await apiClient.post<ParseResponse>(
        "/api/resumes/parse",
        form,
      );
      return data;
    },
  });
}
