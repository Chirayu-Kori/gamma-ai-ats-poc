"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import {
  buildFinalSectionUpdates,
  extractStreamUpdates,
  parseSectionId,
  streamPathForContext,
  streamSectionTargetForContext,
  type SectionStreamContext,
} from "@/lib/stream-section-parser";
import {
  consumeResumeGenerateSse,
  type GenerateRequestBody,
  type StreamPayload,
} from "@/lib/resume-upgrade-stream";
import type { Resume } from "@/lib/types/resume";
import { useResumeStore } from "@/stores/resumeStore";
import { useUploadStore } from "@/stores/uploadStore";

export function useResumeStream() {
  const setResume = useResumeStore((s) => s.setResume);
  const setStreamResume = useResumeStore((s) => s.setStreamResume);
  const applyStreamUpdates = useResumeStore((s) => s.applyStreamUpdates);
  const setStreamingFocus = useResumeStore((s) => s.setStreamingFocus);
  const setStatus = useResumeStore((s) => s.setStatus);

  const sectionBufferRef = useRef("");
  const sectionCtxRef = useRef<SectionStreamContext | null>(null);
  const finishedRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<{
    index: number;
    total: number;
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const flushStreamBuffer = useCallback(() => {
    const ctx = sectionCtxRef.current;
    if (!ctx) return;

    const updates = extractStreamUpdates(sectionBufferRef.current, ctx);
    if (updates.length > 0) {
      applyStreamUpdates(updates);
    }
  }, [applyStreamUpdates]);

  const finishStream = useCallback(
    (finalResume?: Partial<Resume>) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      flushStreamBuffer();
      sectionBufferRef.current = "";
      sectionCtxRef.current = null;
      setStreamingFocus(null);
      setActiveSection(null);
      setSectionProgress(null);

      if (finalResume) {
        setResume(finalResume);
      }
      setStatus("editing");
      setIsComplete(true);
    },
    [flushStreamBuffer, setResume, setStatus, setStreamingFocus],
  );

  const handlePayload = useCallback(
    (payload: StreamPayload) => {
      if (payload.error) {
        const msg =
          typeof payload.error === "string"
            ? payload.error
            : "Generate stream reported an error";
        throw new Error(msg);
      }

      if (payload.event === "start") {
        if (typeof payload.total_sections === "number") {
          setTotalSections(payload.total_sections);
          setSectionProgress({
            index: 0,
            total: payload.total_sections,
          });
        }
        setActiveSection("Starting upgrade…");
        return;
      }

      if (payload.event === "section_start" && payload.section_id) {
        sectionBufferRef.current = "";
        sectionCtxRef.current = parseSectionId(payload.section_id);
        setActiveSection(payload.header ?? payload.section_id);
        const ctx = sectionCtxRef.current;
        setStreamingFocus({
          path: streamPathForContext(ctx),
          target: streamSectionTargetForContext(ctx),
        });
        if (
          typeof payload.index === "number" &&
          typeof payload.total === "number"
        ) {
          setSectionProgress({ index: payload.index, total: payload.total });
        }
        return;
      }

      if (payload.event === "section_error") {
        setWarning(
          `Skipped section "${payload.header ?? payload.section_id}": ${payload.error ?? "error"}`,
        );
        setStreamingFocus(null);
        return;
      }

      if (payload.event === "section_delta" && payload.delta) {
        sectionBufferRef.current += payload.delta;
        flushStreamBuffer();
        return;
      }

      if (payload.event === "section_done") {
        const ctx = sectionCtxRef.current;
        const buf = sectionBufferRef.current;
        flushStreamBuffer();
        if (ctx && buf.trim()) {
          const finalUpdates = buildFinalSectionUpdates(buf, ctx);
          if (finalUpdates.length > 0) {
            applyStreamUpdates(finalUpdates);
          }
        }
        sectionBufferRef.current = "";
        sectionCtxRef.current = null;
        setStreamingFocus(null);
        setSectionsCompleted((count) => count + 1);
        if (
          typeof payload.index === "number" &&
          typeof payload.total === "number"
        ) {
          setSectionProgress({ index: payload.index, total: payload.total });
        }
        return;
      }

      if (payload.event === "done" && payload.resume) {
        finishStream(payload.resume);
      }
    },
    [
      applyStreamUpdates,
      finishStream,
      flushStreamBuffer,
      setStreamingFocus,
    ],
  );

  const mutation = useMutation({
    onMutate: () => {
      finishedRef.current = false;
      sectionBufferRef.current = "";
      sectionCtxRef.current = null;
      setIsComplete(false);
      setError(null);
      setWarning(null);
      setSectionsCompleted(0);
      setTotalSections(0);
      setActiveSection(null);
      setSectionProgress(null);
      setStreamingFocus(null);
      setStatus("streaming");

      const { parsedResume } = useUploadStore.getState();
      if (parsedResume) {
        setStreamResume(parsedResume);
      }
    },
    mutationFn: async (body: GenerateRequestBody) => {
      await consumeResumeGenerateSse(body, undefined, {
        onPayload: handlePayload,
        onDone: () => finishStream(),
      });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Generate stream failed:", msg);
      setError(msg);
      setStreamingFocus(null);
      setStatus("error");
    },
  });

  return {
    start: mutation.mutateAsync,
    isStreaming: mutation.isPending,
    isComplete,
    reset: mutation.reset,
    error,
    warning,
    sectionsCompleted,
    totalSections,
    activeSection,
    sectionProgress,
  };
}
