"use client";

import { useMemo } from "react";
import { Cloud, CloudOff, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useResumePersistence } from "@/hooks/useResumePersistence";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";

function formatSavedAt(iso: string | null): string {
  if (!iso) return "Not saved yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Saved";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CanvasSaveBar() {
  const { resumeId, saveNow } = useResumePersistence();
  const status = useResumeStore((s) => s.status);
  const lastSavedAt = useResumeStore((s) => s.lastSavedAt);
  const hasUnsavedChanges = useResumeStore((s) => s.hasUnsavedChanges);

  const label = useMemo(() => {
    if (!resumeId) return "Save after opening a resume";
    if (status === "saving") return "Saving…";
    if (status === "error") return "Save failed — try again";
    if (hasUnsavedChanges) return "Unsaved changes — autosave pending";
    return `Last saved ${formatSavedAt(lastSavedAt)}`;
  }, [resumeId, status, hasUnsavedChanges, lastSavedAt]);

  const Icon =
    status === "saving"
      ? Loader2
      : status === "error"
        ? CloudOff
        : Cloud;

  return (
    <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center px-4 print:hidden">
      <div
        className={cn(
          "pointer-events-auto flex max-w-lg flex-wrap items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm",
          status === "error" && "border-rose-200",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 text-slate-500",
            status === "saving" && "animate-spin text-blue-600",
            status === "error" && "text-rose-600",
            !hasUnsavedChanges &&
              status !== "saving" &&
              status !== "error" &&
              "text-emerald-600",
          )}
        />
        <span className="text-muted-foreground max-w-[min(100%,14rem)] truncate text-xs sm:max-w-xs">
          {label}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-full px-3 text-xs"
          disabled={!resumeId || status === "saving"}
          onClick={() => void saveNow()}
        >
          <Save className="size-3.5" />
          Save
        </Button>
      </div>
    </div>
  );
}
