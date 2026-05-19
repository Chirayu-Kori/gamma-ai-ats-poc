"use client";

import { useCallback, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { ResumeCanvas } from "@/components/ResumeCanvas";
import { Button } from "@/components/ui/button";
import { useResumeStream } from "@/hooks/useResumeStream";
import { useResumeStore } from "@/stores/resumeStore";
import { useUploadStore } from "@/stores/uploadStore";

type GenerateStreamCanvasProps = {
  resumeId?: string;
  onComplete: () => void | Promise<void>;
};

export function GenerateStreamCanvas({
  resumeId,
  onComplete,
}: GenerateStreamCanvasProps) {
  const {
    start,
    isStreaming,
    isComplete,
    error,
    warning,
    sectionsCompleted,
    totalSections,
    activeSection,
    sectionProgress,
    reset,
  } = useResumeStream();
  const status = useResumeStore((s) => s.status);
  const hasStartedRef = useRef(false);
  const completedRef = useRef(false);

  const runStream = useCallback(() => {
    completedRef.current = false;
    const { parsedResumeId, jdText } = useUploadStore.getState();
    const baseId = resumeId ?? parsedResumeId ?? undefined;
    if (!baseId) {
      console.warn("[generate-stream] no resume id to upgrade");
      return;
    }

    reset();
    start({
      resume_id: baseId,
      jd_text: jdText?.trim() ? jdText : undefined,
    }).catch((err) => {
      console.warn("[generate-stream] start() rejected:", err);
    });
  }, [resumeId, reset, start]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    runStream();
  }, [runStream]);

  useEffect(() => {
    if (completedRef.current) return;
    if (isComplete && status === "editing" && !isStreaming) {
      completedRef.current = true;
      void onComplete();
    }
  }, [isComplete, status, isStreaming, onComplete]);

  const isStreamingNow =
    !isComplete && (status === "streaming" || isStreaming);
  const isError = status === "error" || !!error;
  const progressTotal = sectionProgress?.total ?? totalSections;
  const progressIndex =
    sectionsCompleted > 0
      ? sectionsCompleted
      : (sectionProgress?.index ?? 0) + 1;
  const progressPct =
    progressTotal > 0
      ? Math.min(100, Math.round((progressIndex / progressTotal) * 100))
      : 0;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          {isStreamingNow ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-700">
                  Streaming upgrade…
                </div>
                <div className="truncate text-xs text-slate-500">
                  {activeSection ?? "Preparing sections"}
                  {progressTotal > 0
                    ? ` · ${Math.min(sectionsCompleted, progressTotal)}/${progressTotal} sections`
                    : null}
                </div>
                {progressTotal > 0 && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : isError ? (
            <>
              <AlertTriangle className="size-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">
                Upgrade failed
              </span>
            </>
          ) : isComplete ? (
            <>
              <Sparkles className="size-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                Upgrade complete
              </span>
            </>
          ) : (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                Finalizing…
              </span>
            </>
          )}
        </div>

        {isError && (
          <Button
            size="sm"
            variant="outline"
            onClick={runStream}
            className="mt-3 rounded-full"
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        )}
      </div>

      {warning && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {warning}
        </div>
      )}

      {isError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="break-all">{error ?? "Unknown error"}</p>
        </div>
      )}

      <div
        className={
          isStreamingNow
            ? "rounded-2xl ring-2 ring-blue-200/70 ring-offset-2 ring-offset-slate-100"
            : undefined
        }
      >
        <ResumeCanvas />
      </div>
    </div>
  );
}
