"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGenerateTheme } from "@/hooks/useGenerateTheme";
import { useResumeStore } from "@/stores/resumeStore";

type CustomThemePanelProps = {
  onApplied?: () => void;
};

export function CustomThemePanel({ onApplied }: CustomThemePanelProps) {
  const [prompt, setPrompt] = useState("");
  const setTheme = useResumeStore((s) => s.setTheme);
  const generate = useGenerateTheme();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!prompt.trim()) {
      setError("Describe the theme you want.");
      return;
    }
    setError(null);
    try {
      const tokens = await generate.mutateAsync(prompt.trim());
      const patch: Record<string, string> = {};
      if (tokens.accent) patch.accent = tokens.accent;
      if (tokens.fontHeading) patch.fontHeading = tokens.fontHeading;
      if (tokens.fontBody) patch.fontBody = tokens.fontBody;
      if (Object.keys(patch).length === 0) {
        setError("Theme generation returned no usable tokens.");
        return;
      }
      setTheme(patch);
      onApplied?.();
    } catch (err) {
      console.error(err);
      setError("Theme generation failed. Try again.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <Sparkles className="size-3.5 text-amber-500" />
        Design your own
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder='e.g. "dark navy, serif headings, minimal accents"'
        className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white p-2 text-sm leading-relaxed text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      <Button
        type="button"
        size="sm"
        onClick={onSubmit}
        disabled={generate.isPending}
        className="mt-2 w-full"
      >
        {generate.isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-3.5 animate-spin" />
            Generating theme…
          </span>
        ) : (
          "Generate theme"
        )}
      </Button>
    </div>
  );
}
