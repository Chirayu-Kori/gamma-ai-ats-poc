"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ACCENT_COLORS,
  FONT_OPTIONS,
  getActiveAccentId,
  getActiveFontId,
} from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { TEMPLATES } from "@/components/templates/registry";
import { cn } from "@/lib/utils";

type DesignPanelProps = {
  phase: "generate" | "resume";
};

import { useGenerateStore } from "@/stores/generateStore";
import { FileText, Languages, Hash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CARD_OPTIONS = [5, 8, 10] as const;
const FORMAT_OPTIONS = ["A4", "Letter"] as const;
const LANGUAGE_OPTIONS = [
  "English (US)",
  "English (UK)",
  "Spanish",
  "French",
] as const;

function DesignSelect<T extends string | number>({
  value,
  options,
  onChange,
  formatLabel,
  className,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
  className?: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        className={cn(
          "h-10 w-full rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-100",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={String(opt)} value={String(opt)}>
            {formatLabel ? formatLabel(opt) : String(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DesignField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        {Icon && <Icon className="size-3.5 text-slate-400" />}
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function DesignPanel({ phase }: DesignPanelProps) {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const theme = useResumeStore((s) => s.theme);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setTheme = useResumeStore((s) => s.setTheme);

  const { cardCount, format, language, setCardCount, setFormat, setLanguage } =
    useGenerateStore();

  const activeAccent = getActiveAccentId(theme);
  const activeFont = getActiveFontId(theme);
  const templateIds = Object.keys(TEMPLATES);

  if (phase === "generate") {
    return (
      <div className="bg-background flex h-full min-h-0 flex-col">
        <div className="border-b p-5">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            Generation Settings
          </h2>
        </div>
        <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-5">
          <DesignField label="Card Count" icon={Hash}>
            <DesignSelect
              value={cardCount}
              options={CARD_OPTIONS}
              onChange={(v) => setCardCount(Number(v))}
              formatLabel={(v) => `${v} cards`}
            />
          </DesignField>

          <DesignField label="Format" icon={FileText}>
            <DesignSelect
              value={format}
              options={FORMAT_OPTIONS}
              onChange={setFormat}
            />
          </DesignField>

          <DesignField label="Language" icon={Languages}>
            <DesignSelect
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguage}
            />
          </DesignField>

          <Separator className="my-2" />

          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-700">
            <p className="mb-1 font-semibold">Pro Tip:</p>
            Choose the number of cards based on your experience level. More
            cards allow for a more detailed resume.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b p-5">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Design Details
        </h2>
      </div>
      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-5">
        <div>
          <h3 className="mb-3 text-sm font-semibold">Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {templateIds.map((tid) => {
              const tpl = TEMPLATES[tid];
              const selected = selectedTemplate === tid;
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => setTemplate(tid)}
                  className={cn(
                    "group bg-muted/30 relative flex aspect-[1/1.414] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 p-2 transition-all hover:shadow-sm",
                    selected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:border-primary/40 border-transparent",
                  )}
                  aria-pressed={selected}
                >
                  <div className="bg-background flex h-20 w-16 flex-col gap-1 rounded-sm border border-black/5 p-2 shadow-sm">
                    <div
                      className="h-1 w-full rounded-full"
                      style={{ backgroundColor: theme.accent ?? "#2563eb" }}
                    />
                    <div className="bg-primary/20 h-1 w-2/3 rounded-full" />
                    <div className="bg-muted mt-2 h-1 w-full rounded-full" />
                    <div className="bg-muted h-1 w-full rounded-full" />
                  </div>
                  <span className="text-muted-foreground mt-2 text-xs font-medium">
                    {tpl.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-4 text-sm font-semibold">Color Palette</h3>
          <div
            className="flex flex-wrap gap-2.5"
            role="radiogroup"
            aria-label="Accent color"
          >
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                role="radio"
                aria-checked={activeAccent === color.id}
                title={color.id}
                onClick={() => setTheme({ accent: color.value })}
                className={cn(
                  "h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-105",
                  color.className,
                  activeAccent === color.id &&
                    "ring-primary ring-offset-background ring-2 ring-offset-2",
                )}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-4 text-sm font-semibold">Typography</h3>
          <div className="space-y-2">
            {FONT_OPTIONS.map((font) => {
              const selected = activeFont === font.id;
              return (
                <Button
                  key={font.id}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setTheme({
                      fontHeading: font.fontHeading,
                      fontBody: font.fontBody,
                    })
                  }
                  className={cn(
                    "h-10 w-full justify-between",
                    font.sampleClassName,
                    selected && "border-primary bg-primary/5",
                  )}
                  aria-pressed={selected}
                >
                  {font.label}
                  <span className="text-muted-foreground text-xs tracking-widest uppercase">
                    aa
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
