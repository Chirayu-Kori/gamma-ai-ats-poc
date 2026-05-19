import type { CSSProperties } from "react";

export type PageFormatId =
  | "A4"
  | "Letter"
  | "Legal"
  | "Tabloid"
  | "A3"
  | "A5"
  | "Executive"
  | "B5"
  | "custom";

export type PageSizeUnit = "mm" | "in";

export type PageDimensions = {
  width: number;
  height: number;
  unit: PageSizeUnit;
};

type PresetConfig = PageDimensions & { label: string };

export const PAGE_SIZE_PRESETS: Record<
  Exclude<PageFormatId, "custom">,
  PresetConfig
> = {
  A4: { label: "A4", width: 210, height: 297, unit: "mm" },
  Letter: { label: "US Letter", width: 8.5, height: 11, unit: "in" },
  Legal: { label: "US Legal", width: 8.5, height: 14, unit: "in" },
  Tabloid: { label: "Tabloid", width: 11, height: 17, unit: "in" },
  Executive: { label: "Executive", width: 7.25, height: 10.5, unit: "in" },
  A3: { label: "A3", width: 297, height: 420, unit: "mm" },
  A5: { label: "A5", width: 148, height: 210, unit: "mm" },
  B5: { label: "B5", width: 176, height: 250, unit: "mm" },
};

export const PAGE_FORMAT_OPTIONS: {
  id: PageFormatId;
  label: string;
}[] = [
  ...Object.entries(PAGE_SIZE_PRESETS).map(([id, preset]) => ({
    id: id as Exclude<PageFormatId, "custom">,
    label: formatPresetLabel(id as Exclude<PageFormatId, "custom">, preset),
  })),
  { id: "custom", label: "Custom size…" },
];

function formatPresetLabel(
  id: Exclude<PageFormatId, "custom">,
  preset: PresetConfig,
): string {
  const dim =
    preset.unit === "mm"
      ? `${preset.width} × ${preset.height} mm`
      : `${preset.width} × ${preset.height} in`;
  return `${preset.label} (${dim})`;
}

export function normalizePageFormatId(value: string | undefined): PageFormatId {
  if (value === "custom") return "custom";
  if (value && value in PAGE_SIZE_PRESETS) {
    return value as Exclude<PageFormatId, "custom">;
  }
  return "A4";
}

export function resolvePageDimensions(
  theme: Record<string, string>,
): PageDimensions & { formatId: PageFormatId } {
  const formatId = normalizePageFormatId(theme.pageFormat);

  if (formatId !== "custom") {
    const preset = PAGE_SIZE_PRESETS[formatId];
    return {
      formatId,
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
    };
  }

  const unit: PageSizeUnit = theme.pageUnit === "in" ? "in" : "mm";
  const width = clampDimension(parseFloat(theme.pageWidth), 50, 2000, 210);
  const height = clampDimension(parseFloat(theme.pageHeight), 50, 2000, 297);

  return { formatId: "custom", width, height, unit };
}

function clampDimension(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function toCssLength(value: number, unit: PageSizeUnit): string {
  return `${value}${unit}`;
}

export function pageSizeCssVars(
  theme: Record<string, string>,
): CSSProperties {
  const dims = resolvePageDimensions(theme);
  return {
    "--resume-page-width": toCssLength(dims.width, dims.unit),
    "--resume-page-min-height": toCssLength(dims.height, dims.unit),
  } as CSSProperties;
}

export function getPageFormatLabel(theme: Record<string, string>): string {
  const { formatId } = resolvePageDimensions(theme);
  if (formatId !== "custom") {
    return formatPresetLabel(formatId, PAGE_SIZE_PRESETS[formatId]);
  }
  const dims = resolvePageDimensions(theme);
  return `Custom (${toCssLength(dims.width, dims.unit)} × ${toCssLength(dims.height, dims.unit)})`;
}
