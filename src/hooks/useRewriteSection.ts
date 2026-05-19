"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { apiClient } from "@/lib/api-client";
import type { SectionFieldSnapshot } from "@/lib/section-ai";

export type RewriteSectionRequest = {
  section_id: string;
  section_type: string;
  section_title: string;
  fields: SectionFieldSnapshot[];
  instruction?: string;
  resume_context?: string;
};

export type RewriteSectionResponse = {
  updates: { path: string; value: string }[];
};

export function useRewriteSection() {
  const params = useParams<{ id?: string }>();
  const resumeId = params?.id;

  return useMutation({
    mutationKey: ["resume", resumeId, "rewrite-section"],
    mutationFn: async (body: RewriteSectionRequest) => {
      if (!resumeId) {
        throw new Error("Save the resume before using section AI.");
      }
      const { data } = await apiClient.post<RewriteSectionResponse>(
        `/api/resumes/${resumeId}/rewrite-section`,
        body,
      );
      return data;
    },
  });
}
