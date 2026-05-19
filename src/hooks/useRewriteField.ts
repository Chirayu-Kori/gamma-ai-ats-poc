"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { apiClient } from "@/lib/api-client";

export type RewriteRequest = {
  path: string;
  field_html: string;
  selection_text?: string;
  instruction?: string;
  resume_context?: string;
};

export type RewriteResponse = {
  revised_html: string;
};

export function useRewriteField() {
  const params = useParams<{ id?: string }>();
  const resumeId = params?.id;

  return useMutation({
    mutationKey: ["resume", resumeId, "rewrite"],
    mutationFn: async (body: RewriteRequest) => {
      if (!resumeId) throw new Error("Save the resume before using AI rewrite.");
      const { data } = await apiClient.post<RewriteResponse>(
        `/api/resumes/${resumeId}/rewrite`,
        body,
      );
      return data;
    },
  });
}
