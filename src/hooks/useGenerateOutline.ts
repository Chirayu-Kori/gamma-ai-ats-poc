"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  GenerateOutlineRequest,
  GenerateOutlineResponse,
} from "@/lib/types/resume-outline";

export type GenerateOutlineInput = {
  prompt: string;
  cardCount: number;
  format: "A4" | "Letter";
  language: string;
};

function toRequestBody(input: GenerateOutlineInput): GenerateOutlineRequest {
  return {
    prompt: input.prompt,
    card_count: input.cardCount,
    format: input.format,
    language: input.language,
  };
}

export function useGenerateOutline() {
  return useMutation({
    mutationKey: ["resumes", "generate-outline"],
    mutationFn: async (input: GenerateOutlineInput) => {
      const { data } = await apiClient.post<GenerateOutlineResponse>(
        "/api/resumes/generate",
        toRequestBody(input),
      );
      return data;
    },
  });
}
