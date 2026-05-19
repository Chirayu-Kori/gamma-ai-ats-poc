"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { useRewriteSection } from "@/hooks/useRewriteSection";
import {
  buildResumeContextText,
  getSectionFieldSnapshots,
  normalizeSectionUpdates,
} from "@/lib/section-ai";
import type { ResumeSectionConfig } from "@/lib/types/resume";
import { useResumeStore } from "@/stores/resumeStore";
import { useUploadStore } from "@/stores/uploadStore";
import { cn } from "@/lib/utils";

type SectionAIPanelProps = {
  section: ResumeSectionConfig;
  onDone?: () => void;
  className?: string;
  compact?: boolean;
};

export function SectionAIPanel({
  section,
  onDone,
  className,
  compact = false,
}: SectionAIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resume = useResumeStore((s) => s.resume);
  const jdText = useUploadStore((s) => s.jdText);
  const updateField = useResumeStore((s) => s.updateField);
  const rewrite = useRewriteSection();
  const triggerAutosave = useDebouncedAutosave();

  const runRewrite = async (instruction?: string) => {
    setError(null);
    const fields = getSectionFieldSnapshots(resume, section);
    if (!fields.length) {
      setError("This section has no editable content yet.");
      return;
    }

    try {
      const resume_context = buildResumeContextText(resume, {
        jdText,
        editingSectionType: section.type,
        editingSectionTitle: section.title,
      });

      const result = await rewrite.mutateAsync({
        section_id: section.id,
        section_type: section.type,
        section_title: section.title,
        fields,
        resume_context,
        instruction: instruction ?? (prompt.trim() || undefined),
      });

      const updates = normalizeSectionUpdates(
        result.updates.map((u) => ({ path: u.path, value: u.value })),
      );

      for (const { path, value } of updates) {
        updateField(path, value);
      }
      triggerAutosave();
      setPrompt("");
      onDone?.();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Section rewrite failed. Try again.",
      );
    }
  };

  return (
    <div
      data-section-ai
      className={cn(
        compact ? "p-2" : "mb-3 rounded-lg border border-violet-200 bg-violet-50/90 p-3 shadow-sm",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!compact && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-violet-800">
          <Sparkles className="size-3.5" />
          Edit section with AI
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={compact ? 2 : 2}
        placeholder="Optional prompt…"
        className="w-full resize-none rounded-md border border-violet-200 bg-white p-2 text-xs text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        disabled={rewrite.isPending}
      />

      {error && <p className="mt-1.5 text-[11px] text-rose-600">{error}</p>}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 gap-1.5 text-xs"
          disabled={rewrite.isPending}
          onClick={() => void runRewrite()}
        >
          {rewrite.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Wand2 className="size-3.5" />
          )}
          Regenerate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 border-violet-200 bg-white text-xs"
          disabled={rewrite.isPending}
          onClick={() =>
            void runRewrite(
              "Improve clarity, impact, and professional tone for this entire section.",
            )
          }
        >
          Improve
        </Button>
      </div>
    </div>
  );
}
