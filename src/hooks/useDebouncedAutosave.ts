"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { apiClient } from "@/lib/api-client";
import { useResumeStore } from "../stores/resumeStore";

export function useDebouncedAutosave(delay = 800) {
  const setStatus = useResumeStore((s) => s.setStatus);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const params = useParams<{ id?: string }>();
  const resumeId = params?.id;

  const triggerAutosave = useCallback(() => {
    if (!resumeId) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const { resume, theme, selectedTemplate } = useResumeStore.getState();
        await apiClient.put(`/api/resumes/${resumeId}`, {
          resume,
          theme,
          template_id: selectedTemplate,
        });
        setStatus("editing");
      } catch (err) {
        console.error("Autosave failed", err);
        setStatus("error");
      }
    }, delay);
  }, [delay, setStatus, resumeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return triggerAutosave;
}
