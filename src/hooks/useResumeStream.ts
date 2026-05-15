"use client";

import { useMutation } from "@tanstack/react-query";
import { parse } from "partial-json";
import { useRef } from "react";

import { consumeResumeUpgradeSse } from "@/lib/resume-upgrade-stream";
import { useResumeStore } from "@/stores/resumeStore";

export function useResumeStream() {
  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const bufferRef = useRef("");

  const mutation = useMutation({
    onMutate: () => {
      bufferRef.current = "";
      setStatus("streaming");
    },
    mutationFn: async ({
      rawText,
      targetRole,
    }: {
      rawText: string;
      targetRole?: string;
    }) => {
      await consumeResumeUpgradeSse(
        { raw_text: rawText, target_role: targetRole },
        undefined,
        {
          onPayload: ({ delta, error }) => {
            if (error) {
              throw new Error(
                typeof error === "string" ? error : "Upgrade stream reported an error"
              );
            }
            if (!delta) return;
            bufferRef.current += delta;
            try {
              const partial = parse(bufferRef.current);
              setResume(partial);
            } catch {
              // not enough JSON yet
            }
          },
          onDone: () => {
            setStatus("editing");
          },
        }
      );
    },
    onError: (err) => {
      console.error("Stream failed", err);
      setStatus("error");
    },
  });

  return {
    start: mutation.mutateAsync,
    isUpgradePending: mutation.isPending,
    resetUpgrade: mutation.reset,
  };
}
