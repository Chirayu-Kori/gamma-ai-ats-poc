"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ACCENT_COLORS,
  DEFAULT_RESUME_THEME,
  FONT_OPTIONS,
  getActiveAccentId,
  getActiveFontId,
  getPageFormat,
  mergeThemeDefaults,
} from "@/lib/resume-theme";
import {
  PAGE_FORMAT_OPTIONS,
  type PageFormatId,
  type PageSizeUnit,
} from "@/lib/page-size";
import type { PageSizePatch } from "@/stores/generateStore";
import { useResumeStore } from "@/stores/resumeStore";
import {
  TEMPLATES,
  type TemplateLayout,
} from "@/components/templates/registry";
import { cn } from "@/lib/utils";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { AccentColorCanvas } from "@/components/editor/accent-color-canvas";
type DesignPanelProps = {
  phase: "upload" | "generate" | "resume";
};

import { useGenerateStore } from "@/stores/generateStore";
import { ChevronDown, FileText, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEMPLATE_PREVIEW_COUNT = 4;

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

function TypographySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (fontId: string) => void;
}) {
  const selected =
    FONT_OPTIONS.find((font) => font.id === value) ?? FONT_OPTIONS[0];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="h-10 w-full rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-100"
        style={{ fontFamily: selected.fontBody }}
      >
        <SelectValue asChild>
          <span style={{ fontFamily: selected.fontBody }}>{selected.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FONT_OPTIONS.map((font) => (
          <SelectItem key={font.id} value={font.id} className="text-base">
            <span style={{ fontFamily: font.fontBody }}>{font.label}</span>
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

function PageSizeFields({
  variant,
  onAutosave,
}: {
  variant: "upload" | "resume";
  onAutosave?: () => void;
}) {
  const theme = useResumeStore((s) => s.theme);
  const setPageSize = useResumeStore((s) => s.setPageSize);
  const genFormat = useGenerateStore((s) => s.format);
  const genWidth = useGenerateStore((s) => s.pageWidth);
  const genHeight = useGenerateStore((s) => s.pageHeight);
  const genUnit = useGenerateStore((s) => s.pageUnit);
  const setGenPageSize = useGenerateStore((s) => s.setPageSize);

  const isUpload = variant === "upload";
  const format: PageFormatId = isUpload ? genFormat : getPageFormat(theme);
  const merged = mergeThemeDefaults(
    isUpload
      ? ({
          pageFormat: genFormat,
          pageWidth: genWidth,
          pageHeight: genHeight,
          pageUnit: genUnit,
        } as Record<string, string>)
      : theme,
  );
  const unit: PageSizeUnit = merged.pageUnit === "in" ? "in" : "mm";
  const isCustom = format === "custom";

  const apply = (patch: PageSizePatch) => {
    if (isUpload) {
      setGenPageSize(patch);
    } else {
      setPageSize(patch);
      onAutosave?.();
    }
  };

  return (
    <div className="space-y-3">
      <DesignField label="Page size" icon={FileText}>
        <DesignSelect
          value={format}
          options={PAGE_FORMAT_OPTIONS.map((opt) => opt.id)}
          formatLabel={(id) =>
            PAGE_FORMAT_OPTIONS.find((opt) => opt.id === id)?.label ?? id
          }
          onChange={(id) => apply({ format: id as PageFormatId })}
        />
      </DesignField>

      {isCustom && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-xs font-medium text-slate-600">Custom dimensions</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                Width
              </span>
              <input
                type="number"
                min={unit === "mm" ? 50 : 2}
                max={unit === "mm" ? 2000 : 80}
                step={unit === "mm" ? 1 : 0.1}
                value={merged.pageWidth}
                onChange={(e) =>
                  apply({ width: Number(e.target.value), unit })
                }
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                Height
              </span>
              <input
                type="number"
                min={unit === "mm" ? 50 : 2}
                max={unit === "mm" ? 2000 : 80}
                step={unit === "mm" ? 1 : 0.1}
                value={merged.pageHeight}
                onChange={(e) =>
                  apply({ height: Number(e.target.value), unit })
                }
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            {(["mm", "in"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => apply({ unit: u })}
                className={cn(
                  "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                  unit === u
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {u === "mm" ? "Millimeters" : "Inches"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded border border-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-700"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
          aria-label={`${label} color picker`}
        />
      </div>
    </div>
  );
}

function TemplatePreview({
  layout,
  accent,
  sidebar,
}: {
  layout: TemplateLayout;
  accent: string;
  sidebar: string;
}) {
  const bar = (className: string, color: string) => (
    <div className={className} style={{ backgroundColor: color }} />
  );

  return (
    <div className="bg-background flex h-20 w-16 flex-col overflow-hidden rounded-sm border border-black/5 p-1.5 shadow-sm">
      {layout === "band-header" && (
        <>
          {bar("mb-1 h-2.5 w-full shrink-0 rounded-sm", accent)}
          <div className="bg-muted h-1 w-2/3 rounded-full" />
          <div className="bg-muted mt-1.5 h-1 w-full rounded-full" />
          <div className="bg-muted mt-1 h-1 w-full rounded-full" />
        </>
      )}
      {layout === "sidebar-left" && (
        <div className="flex h-full gap-1">
          {bar("w-4 shrink-0 rounded-sm", sidebar)}
          <div className="flex flex-1 flex-col gap-1 pt-0.5">
            <div className="bg-muted h-1 w-full rounded-full" />
            <div className="bg-muted h-1 w-full rounded-full" />
            <div className="bg-muted h-1 w-2/3 rounded-full" />
          </div>
        </div>
      )}
      {layout === "sidebar-right" && (
        <div className="flex h-full gap-1">
          <div className="flex flex-1 flex-col gap-1 pt-0.5">
            {bar("mb-0.5 h-0.5 w-full rounded-full", accent)}
            <div className="bg-muted h-1 w-full rounded-full" />
            <div className="bg-muted h-1 w-full rounded-full" />
          </div>
          {bar("w-4 shrink-0 rounded-sm opacity-60", accent)}
        </div>
      )}
      {layout === "stripe" && (
        <div className="flex h-full gap-1">
          {bar("w-1 shrink-0 rounded-full", accent)}
          <div className="flex flex-1 flex-col gap-1 pt-0.5">
            <div className="bg-muted h-1 w-2/3 rounded-full" />
            <div className="bg-muted h-1 w-full rounded-full" />
            <div className="bg-muted h-1 w-full rounded-full" />
          </div>
        </div>
      )}
      {layout === "two-column" && (
        <>
          <div className="bg-muted h-1 w-2/3 rounded-full" />
          <div className="mt-1.5 grid flex-1 grid-cols-2 gap-1">
            <div className="space-y-1">
              <div className="bg-muted h-1 w-full rounded-full" />
              <div className="bg-muted h-1 w-full rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="bg-muted h-1 w-full rounded-full" />
              <div className="bg-muted h-1 w-2/3 rounded-full" />
            </div>
          </div>
        </>
      )}
      {layout === "single" && (
        <>
          {bar("mb-1 h-1 w-full rounded-full", accent)}
          <div className="bg-muted h-1 w-2/3 rounded-full" />
          <div className="bg-muted mt-2 h-1 w-full rounded-full" />
          <div className="bg-muted h-1 w-full rounded-full" />
        </>
      )}
    </div>
  );
}

function getVisibleTemplateIds(
  allIds: string[],
  selectedId: string,
  showAll: boolean,
): string[] {
  if (showAll || allIds.length <= TEMPLATE_PREVIEW_COUNT) return allIds;
  const first = allIds.slice(0, TEMPLATE_PREVIEW_COUNT);
  if (first.includes(selectedId)) return first;
  return [selectedId, ...first.filter((id) => id !== selectedId).slice(0, 3)];
}

export function DesignPanel({ phase }: DesignPanelProps) {
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const theme = useResumeStore((s) => s.theme);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setTheme = useResumeStore((s) => s.setTheme);
  const triggerAutosave = useDebouncedAutosave();
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const applyTemplate = (id: string) => {
    setTemplate(id);
    triggerAutosave();
  };
  const applyTheme = (patch: Record<string, string>) => {
    setTheme(patch);
    triggerAutosave();
  };

  const { language, setLanguage } = useGenerateStore();

  const mergedTheme = mergeThemeDefaults(theme);
  const activeAccent = getActiveAccentId(theme);
  const activeFont = getActiveFontId(theme);
  const templateIds = Object.keys(TEMPLATES);
  const visibleTemplateIds = useMemo(
    () => getVisibleTemplateIds(templateIds, selectedTemplate, showAllTemplates),
    [templateIds, selectedTemplate, showAllTemplates],
  );
  const hasMoreTemplates = templateIds.length > TEMPLATE_PREVIEW_COUNT;

  if (phase === "upload") {
    return (
      <div className="bg-background flex h-full min-h-0 flex-col">
        <div className="border-b p-5">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            Design Details
          </h2>
        </div>
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          <PageSizeFields variant="upload" />
          <DesignField label="Language" icon={Languages}>
            <DesignSelect
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguage}
            />
          </DesignField>
          <Separator className="my-2" />
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-700">
            Upload a PDF/image (and optionally a job description) to begin. You
            can change template and theme during generation.
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
        <PageSizeFields variant="resume" onAutosave={triggerAutosave} />

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold">Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {visibleTemplateIds.map((tid) => {
              const tpl = TEMPLATES[tid];
              const selected = selectedTemplate === tid;
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => applyTemplate(tid)}
                  className={cn(
                    "group bg-muted/30 relative flex aspect-[1/1.414] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 p-2 transition-all hover:shadow-sm",
                    selected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:border-primary/40 border-transparent",
                  )}
                  aria-pressed={selected}
                  title={tpl.description}
                >
                  <TemplatePreview
                    layout={tpl.layout}
                    accent={mergedTheme.accent}
                    sidebar={mergedTheme.sidebarColor}
                  />
                  <span className="text-muted-foreground mt-2 text-xs font-medium">
                    {tpl.name}
                  </span>
                </button>
              );
            })}
          </div>
          {hasMoreTemplates && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground mt-3 w-full gap-1.5"
              onClick={() => setShowAllTemplates((open) => !open)}
            >
              {showAllTemplates
                ? "Show fewer templates"
                : `Show ${templateIds.length - TEMPLATE_PREVIEW_COUNT} more`}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  showAllTemplates && "rotate-180",
                )}
              />
            </Button>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="mb-4 text-sm font-semibold">Accent Colors</h3>
          <div
            className="mb-4 flex flex-wrap gap-2.5"
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
                onClick={() =>
                  applyTheme({
                    accent: color.value,
                    sidebarColor: color.value,
                    iconColor: color.value,
                  })
                }
                className={cn(
                  "h-8 w-8 rounded-full border shadow-sm transition-all hover:scale-105",
                  color.className,
                  activeAccent === color.id &&
                    "ring-primary ring-offset-background ring-2 ring-offset-2",
                )}
              />
            ))}
          </div>

          <AccentColorCanvas
            className="mb-4"
            value={mergedTheme.accent}
            onChange={(accent) =>
              applyTheme({ accent, sidebarColor: accent, iconColor: accent })
            }
          />

          <h3 className="mb-3 text-sm font-semibold">Custom Colors</h3>
          <div className="space-y-2">
            <ColorInput
              label="Sidebar"
              value={mergedTheme.sidebarColor}
              onChange={(sidebarColor) => applyTheme({ sidebarColor })}
            />
            <ColorInput
              label="Heading"
              value={mergedTheme.headingColor}
              onChange={(headingColor) => applyTheme({ headingColor })}
            />
            <ColorInput
              label="Body text"
              value={mergedTheme.textColor}
              onChange={(textColor) => applyTheme({ textColor })}
            />
            <ColorInput
              label="Background"
              value={mergedTheme.backgroundColor}
              onChange={(backgroundColor) => applyTheme({ backgroundColor })}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => applyTheme({ ...DEFAULT_RESUME_THEME })}
            >
              Reset colors
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold">Typography</h3>
          <TypographySelect
            value={activeFont}
            onChange={(id) => {
              const font = FONT_OPTIONS.find((f) => f.id === id);
              if (!font) return;
              applyTheme({
                fontHeading: font.fontHeading,
                fontBody: font.fontBody,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
