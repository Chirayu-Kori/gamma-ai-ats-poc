"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { persistResume } from "@/lib/persist-resume";
import { useResumeStore } from "@/stores/resumeStore";

export function useResumePersistence(delay = 800) {
  const params = useParams<{ id?: string }>();
  const resumeId = params?.id;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const setStatus = useResumeStore((s) => s.setStatus);
  const setLastSavedAt = useResumeStore((s) => s.setLastSavedAt);
  const markUnsaved = useResumeStore((s) => s.markUnsaved);
  const clearUnsaved = useResumeStore((s) => s.clearUnsaved);

  const runSave = useCallback(async () => {
    if (!resumeId || savingRef.current) return false;
    savingRef.current = true;
    setStatus("saving");
    try {
      const record = await persistResume(resumeId);
      setLastSavedAt(record.updated_at ?? new Date().toISOString());
      clearUnsaved();
      setStatus("editing");
      return true;
    } catch (err) {
      console.error("Save failed", err);
      setStatus("error");
      return false;
    } finally {
      savingRef.current = false;
    }
  }, [resumeId, setStatus, setLastSavedAt, clearUnsaved]);

  const saveNow = useCallback(async () => {
    if (!resumeId) return false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return runSave();
  }, [resumeId, runSave]);

  const triggerAutosave = useCallback(() => {
    if (!resumeId) return;
    markUnsaved();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSave();
    }, delay);
  }, [delay, markUnsaved, resumeId, runSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { resumeId, triggerAutosave, saveNow, runSave };
}
