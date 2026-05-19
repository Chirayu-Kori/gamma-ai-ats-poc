import type { CSSProperties } from "react";

import {
  normalizePageFormatId,
  type PageFormatId,
  type PageSizeUnit,
} from "@/lib/page-size";
import type { TemplateLayout } from "@/components/templates/registry";

export const DEFAULT_RESUME_THEME = {
  accent: "#2563eb",
  textColor: "#1e293b",
  headingColor: "#0f172a",
  backgroundColor: "#ffffff",
  sidebarColor: "#2563eb",
  fontHeading: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif',
  pageLayout: "single" as TemplateLayout,
  pageFormat: "A4" as PageFormatId,
  pageWidth: "210",
  pageHeight: "297",
  pageUnit: "mm" as PageSizeUnit,
} as const;

export type ResumeThemeKey = keyof typeof DEFAULT_RESUME_THEME;

export const ACCENT_COLORS = [
  { id: "blue", value: "#2563eb", className: "bg-blue-600" },
  { id: "slate", value: "#0f172a", className: "bg-slate-900" },
  { id: "emerald", value: "#059669", className: "bg-emerald-600" },
  { id: "violet", value: "#7c3aed", className: "bg-violet-600" },
  { id: "rose", value: "#e11d48", className: "bg-rose-600" },
  { id: "amber", value: "#d97706", className: "bg-amber-600" },
  { id: "teal", value: "#0d9488", className: "bg-teal-600" },
  { id: "indigo", value: "#4f46e5", className: "bg-indigo-600" },
] as const;

export const TEXT_COLORS = [
  { id: "slate", value: "#1e293b", label: "Slate" },
  { id: "black", value: "#0a0a0a", label: "Black" },
  { id: "gray", value: "#64748b", label: "Gray" },
  { id: "blue", value: "#1d4ed8", label: "Blue" },
  { id: "emerald", value: "#047857", label: "Green" },
  { id: "rose", value: "#be123c", label: "Rose" },
  { id: "violet", value: "#6d28d9", label: "Violet" },
  { id: "amber", value: "#b45309", label: "Amber" },
] as const;

export const FONT_OPTIONS = [
  {
    id: "inter",
    label: "Inter",
    fontHeading: '"Inter", sans-serif',
    fontBody: '"Inter", sans-serif',
    sampleClassName: "font-sans",
  },
  {
    id: "roboto",
    label: "Roboto",
    fontHeading: '"Roboto", sans-serif',
    fontBody: '"Roboto", sans-serif',
    sampleClassName: "font-sans",
  },
  {
    id: "lato",
    label: "Lato",
    fontHeading: '"Lato", sans-serif',
    fontBody: '"Lato", sans-serif',
    sampleClassName: "font-sans",
  },
  {
    id: "open-sans",
    label: "Open Sans",
    fontHeading: '"Open Sans", sans-serif',
    fontBody: '"Open Sans", sans-serif',
    sampleClassName: "font-sans",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    fontHeading: '"Merriweather", serif',
    fontBody: '"Merriweather", serif',
    sampleClassName: "font-serif",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Playfair Display", serif',
    sampleClassName: "font-serif",
  },
  {
    id: "georgia",
    label: "Georgia",
    fontHeading: "Georgia, serif",
    fontBody: "Georgia, serif",
    sampleClassName: "font-serif",
  },
] as const;

export const BUBBLE_FONT_OPTIONS = FONT_OPTIONS;

export function resumeThemeToCssVars(theme: Record<string, string>) {
  return {
    "--color-accent": theme.accent ?? DEFAULT_RESUME_THEME.accent,
    "--color-text": theme.textColor ?? DEFAULT_RESUME_THEME.textColor,
    "--color-heading": theme.headingColor ?? DEFAULT_RESUME_THEME.headingColor,
    "--color-bg": theme.backgroundColor ?? DEFAULT_RESUME_THEME.backgroundColor,
    "--color-sidebar":
      theme.sidebarColor ?? theme.accent ?? DEFAULT_RESUME_THEME.sidebarColor,
    "--font-heading": theme.fontHeading ?? DEFAULT_RESUME_THEME.fontHeading,
    "--font-body": theme.fontBody ?? DEFAULT_RESUME_THEME.fontBody,
  } as CSSProperties;
}

export function getActiveFontId(theme: Record<string, string>) {
  return (
    FONT_OPTIONS.find(
      (f) =>
        f.fontHeading === theme.fontHeading && f.fontBody === theme.fontBody,
    )?.id ?? "inter"
  );
}

export function getActiveAccentId(theme: Record<string, string>) {
  return ACCENT_COLORS.find((c) => c.value === theme.accent)?.id ?? "custom";
}

export function mergeThemeDefaults(theme: Record<string, string>) {
  return { ...DEFAULT_RESUME_THEME, ...theme };
}

export function getPageLayout(theme: Record<string, string>): TemplateLayout {
  const layout = theme.pageLayout as TemplateLayout | undefined;
  const valid: TemplateLayout[] = [
    "single",
    "sidebar-left",
    "sidebar-right",
    "band-header",
    "stripe",
    "two-column",
  ];
  return layout && valid.includes(layout) ? layout : "single";
}

export function getPageFormat(theme: Record<string, string>): PageFormatId {
  return normalizePageFormatId(theme.pageFormat);
}

export {
  resolvePageDimensions,
  pageSizeCssVars,
  getPageFormatLabel,
} from "@/lib/page-size";
