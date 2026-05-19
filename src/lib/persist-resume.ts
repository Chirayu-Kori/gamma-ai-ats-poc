import { apiClient } from "@/lib/api-client";
import type { ResumeRecord } from "@/lib/types/resume-meta";
import { useResumeStore } from "@/stores/resumeStore";

export async function persistResume(resumeId: string): Promise<ResumeRecord> {
  const { resume, theme, selectedTemplate } = useResumeStore.getState();
  const { data } = await apiClient.put<ResumeRecord>(`/api/resumes/${resumeId}`, {
    resume,
    theme,
    template_id: selectedTemplate,
  });
  return data;
}
