"use client";

import { useMutation } from "@tanstack/react-query";
import { parse } from "partial-json";
import { useRef, useState } from "react";

import {
  consumeResumeGenerateSse,
  type GenerateRequestBody,
} from "@/lib/resume-upgrade-stream";
import { useResumeStore } from "@/stores/resumeStore";

export function useResumeStream() {
  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const bufferRef = useRef("");
  const [error, setError] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState(0);

  const mutation = useMutation({
    onMutate: () => {
      bufferRef.current = "";
      setError(null);
      setChunkCount(0);
      setStatus("streaming");
    },
    mutationFn: async (body: GenerateRequestBody) => {
      await consumeResumeGenerateSse(body, undefined, {
        onPayload: ({ delta, error: payloadError }) => {
          if (payloadError) {
            const msg =
              typeof payloadError === "string"
                ? payloadError
                : "Generate stream reported an error";
            throw new Error(msg);
          }
          if (!delta) return;
          bufferRef.current += delta;
          setChunkCount((c) => c + 1);
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
      });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Generate stream failed:", msg);
      setError(msg);
      setStatus("error");
    },
  });

  return {
    start: mutation.mutateAsync,
    isStreaming: mutation.isPending,
    reset: mutation.reset,
    error,
    chunkCount,
  };
}
