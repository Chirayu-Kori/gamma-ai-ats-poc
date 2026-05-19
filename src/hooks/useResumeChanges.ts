"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { ResumeDiff } from "@/lib/resume-diff";
import { resumeQueryKeys } from "@/lib/query-keys";

export function useResumeChanges(resumeId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: [...resumeQueryKeys.detail(resumeId ?? ""), "changes"],
    queryFn: async () => {
      const { data } = await apiClient.get<ResumeDiff>(
        `/api/resumes/${resumeId}/changes`,
      );
      return data;
    },
    enabled: Boolean(resumeId) && enabled,
    staleTime: 30_000,
  });
}
