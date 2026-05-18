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
  onComplete: () => void;
};

export function GenerateStreamCanvas({
  resumeId,
  onComplete,
}: GenerateStreamCanvasProps) {
  const { start, isStreaming, error, chunkCount, reset } = useResumeStream();
  const status = useResumeStore((s) => s.status);
  const resume = useResumeStore((s) => s.resume);
  const hasStartedRef = useRef(false);

  const runStream = useCallback(() => {
    // Read store state at run time so we don't capture a stale snapshot from
    // the first render closure.
    const { parsedResume, parsedResumeId, jdText } = useUploadStore.getState();
    const baseId = resumeId ?? parsedResumeId ?? undefined;
    if (!baseId && !parsedResume) {
      console.warn(
        "[generate-stream] nothing to stream from — no resume id and no parsed resume in upload store",
      );
      return;
    }
    reset();
    start({
      resume_id: baseId,
      resume: parsedResume ?? undefined,
      jd_text: jdText && jdText.trim() ? jdText : undefined,
    }).catch((err) => {
      // useResumeStream already handled it; this catch suppresses the
      // unhandled-promise warning.
      console.warn("[generate-stream] start() rejected:", err);
    });
  }, [resumeId, reset, start]);

  // Auto-start once on mount (unless we already have content)
  useEffect(() => {
    if (hasStartedRef.current) return;
    if (status === "streaming") return;
    if (resume && resume.experience && resume.experience.length > 0) return;
    hasStartedRef.current = true;
    runStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isStreamingNow = status === "streaming" || isStreaming;
  const isDone = status === "editing" && !!resume;
  const isError = status === "error" || !!error;

  let badge: React.ReactNode;
  if (isStreamingNow) {
    badge = (
      <>
        <Loader2 className="size-4 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-700">
          Generating your upgraded resume…
        </span>
        <span className="text-xs text-slate-400">({chunkCount} chunks)</span>
      </>
    );
  } else if (isError) {
    badge = (
      <>
        <AlertTriangle className="size-4 text-rose-600" />
        <span className="text-sm font-medium text-rose-700">
          Generation failed
        </span>
      </>
    );
  } else if (isDone) {
    badge = (
      <>
        <Sparkles className="size-4 text-emerald-600" />
        <span className="text-sm font-medium text-slate-700">
          Generation complete
        </span>
      </>
    );
  } else {
    badge = (
      <>
        <Sparkles className="size-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-500">Idle</span>
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">{badge}</div>
        <div className="flex items-center gap-2">
          {(isError || (!isStreamingNow && !isDone)) && (
            <Button
              size="sm"
              variant="outline"
              onClick={runStream}
              className="rounded-full"
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              {isError ? "Retry generation" : "Run generation"}
            </Button>
          )}
          <Button
            size="sm"
            disabled={!isDone}
            onClick={onComplete}
            className="rounded-full bg-[#1e3a5f] px-5 hover:bg-[#162d4a]"
          >
            Continue editing
          </Button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold">The stream errored out.</div>
              <div className="mt-1 break-all opacity-90">
                {error ?? "Unknown error"}
              </div>
              <div className="mt-2 text-xs opacity-70">
                Check the FastAPI terminal — the full traceback is logged
                under <code>ERROR:gemini:</code>. Common causes: Gemini quota,
                an invalid API key, or a network issue.
              </div>
            </div>
          </div>
        </div>
      )}

      <ResumeCanvas />
    </div>
  );
}
