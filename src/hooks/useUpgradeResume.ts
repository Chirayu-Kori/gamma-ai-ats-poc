"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { Resume } from "@/lib/types/resume";

export type UpgradeRequestBody = {
  resume_id?: string;
  resume?: Partial<Resume>;
  jd_text?: string;
  target_role?: string;
  instruction?: string;
};

export function useUpgradeResume() {
  return useMutation({
    mutationFn: async (body: UpgradeRequestBody) => {
      const { data } = await apiClient.post<{ resume: Resume }>(
        "/api/resumes/generate",
        body,
      );
      return data.resume;
    },
  });
}
