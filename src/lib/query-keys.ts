export const resumeQueryKeys = {
  all: ["resumes"] as const,
  detail: (id: string) => [...resumeQueryKeys.all, id] as const,
};
