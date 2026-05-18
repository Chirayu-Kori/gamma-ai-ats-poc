"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export type GeneratedTheme = {
  accent?: string;
  fontHeading?: string;
  fontBody?: string;
};

export function useGenerateTheme() {
  return useMutation({
    mutationKey: ["themes", "generate"],
    mutationFn: async (prompt: string) => {
      const { data } = await apiClient.post<GeneratedTheme>(
        "/api/themes/generate",
        { prompt },
      );
      return data;
    },
  });
}
