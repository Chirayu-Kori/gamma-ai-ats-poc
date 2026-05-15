import { useCallback, useRef } from "react";
import { useResumeStore } from "../stores/resumeStore";

export function useDebouncedAutosave(delay = 800) {
  const setStatus = useResumeStore((s) => s.setStatus);
  const resume = useResumeStore((s) => s.resume);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        // Call backend API conditionally if we have a resume ID
        // For now, we will mock the save since we don't have persistence yet
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log("Autosave: ", resume);
        setStatus("editing");
      } catch {
        setStatus("error");
      }
    }, delay);
  }, [delay, setStatus, resume]);

  return triggerAutosave;
}
