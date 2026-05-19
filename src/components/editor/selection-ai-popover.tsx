"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRewriteField } from "@/hooks/useRewriteField";

type SelectionAIPopoverProps = {
  editor: Editor;
  fieldPath: string;
  onApplied: (html: string) => void;
  onClose: () => void;
};

export function SelectionAIPopover({
  editor,
  fieldPath,
  onApplied,
  onClose,
}: SelectionAIPopoverProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rewrite = useRewriteField();

  const runRewrite = async (instruction?: string) => {
    setError(null);
    const { from, to } = editor.state.selection;
    const selectionText = editor.state.doc.textBetween(from, to, " ");
    const fieldHtml = editor.getHTML();

    try {
      const result = await rewrite.mutateAsync({
        path: fieldPath,
        field_html: fieldHtml,
        selection_text: selectionText || undefined,
        instruction: instruction ?? (prompt.trim() || undefined),
      });
      const revised = result.revised_html;
      editor.commands.setContent(revised, { emitUpdate: true });
      onApplied(revised);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "AI rewrite failed. Try again.",
      );
    }
  };

  return (
    <div className="mt-2 w-72 border-t border-slate-100 pt-2">
      <div className="flex items-center gap-1.5 px-0.5 text-[11px] font-semibold tracking-wide text-violet-700 uppercase">
        <Sparkles className="size-3.5" />
        AI rewrite
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder="Optional: e.g. make more metrics-driven, shorter, formal tone…"
        className="mt-1.5 w-full resize-none rounded-md border border-slate-200 bg-slate-50/80 p-2 text-xs text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
        onMouseDown={(e) => e.stopPropagation()}
      />
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
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
          className="h-8 text-xs"
          disabled={rewrite.isPending}
          onClick={() =>
            void runRewrite("Improve clarity and impact for a resume.")
          }
        >
          Improve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
