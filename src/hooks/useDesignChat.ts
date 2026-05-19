"use client";

import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { apiClient } from "@/lib/api-client";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type DesignChatRequest = {
  message: string;
  theme: Record<string, string>;
  template_id: string;
  history?: ChatTurn[];
};

export type DesignChatResponse = {
  message: string;
  theme?: Record<string, string>;
  template_id?: string;
};

export function useDesignChat() {
  const params = useParams<{ id?: string }>();
  const resumeId = params?.id;

  return useMutation({
    mutationKey: ["resume", resumeId, "design-chat"],
    mutationFn: async (body: DesignChatRequest) => {
      if (!resumeId) throw new Error("Open a saved resume to use the design assistant.");
      const { data } = await apiClient.post<DesignChatResponse>(
        `/api/resumes/${resumeId}/design-chat`,
        body,
      );
      return data;
    },
  });
}
