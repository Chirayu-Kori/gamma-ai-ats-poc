export const resumeQueryKeys = {
  all: ["resumes"] as const,
  detail: (id: string) => [...resumeQueryKeys.all, id] as const,
  outline: (params: {
    prompt: string;
    cardCount: number;
    format: string;
    language: string;
  }) => [...resumeQueryKeys.all, "outline", params] as const,
};
