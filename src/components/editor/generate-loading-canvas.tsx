"use client";

import { useCallback, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpgradeResume } from "@/hooks/useUpgradeResume";
import { useResumeStore } from "@/stores/resumeStore";
import { useUploadStore } from "@/stores/uploadStore";

type GenerateLoadingCanvasProps = {
  resumeId?: string;
  onComplete: () => void | Promise<void>;
};

export function GenerateLoadingCanvas({
  resumeId,
  onComplete,
}: GenerateLoadingCanvasProps) {
  const upgrade = useUpgradeResume();
  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const status = useResumeStore((s) => s.status);
  const hasStartedRef = useRef(false);

  const runUpgrade = useCallback(() => {
    const { parsedResumeId, jdText } = useUploadStore.getState();
    const baseId = resumeId ?? parsedResumeId ?? undefined;
    if (!baseId) {
      console.warn("[upgrade] no resume id to upgrade");
      return;
    }

    setStatus("generating");
    upgrade
      .mutateAsync({
        resume_id: baseId,
        jd_text: jdText?.trim() ? jdText : undefined,
      })
      .then((resume) => {
        setResume(resume);
        setStatus("editing");
        return onComplete();
      })
      .catch((err) => {
        console.error("[upgrade] failed:", err);
        setStatus("error");
      });
  }, [resumeId, upgrade, setResume, setStatus, onComplete]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    runUpgrade();
  }, [runUpgrade]);

  const isError = upgrade.isError || status === "error";

  if (isError) {
    const msg =
      upgrade.error instanceof Error ? upgrade.error.message : "Upgrade failed";
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-8 py-16 text-center">
          <AlertTriangle className="size-10 text-rose-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            Upgrade failed
          </h3>
          <p className="mt-2 max-w-md text-sm break-all text-slate-600">
            {msg}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={runUpgrade}
            className="mt-6 rounded-full"
            disabled={upgrade.isPending}
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
        <div className="rounded-full bg-blue-50 p-5">
          <Loader2 className="size-10 animate-spin text-blue-600" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-slate-800">
          Upgrading your resume…
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Improving headline, summary, and bullets based on your parsed resume.
          This usually takes 15–45 seconds.
        </p>
      </div>
    </div>
  );
}
