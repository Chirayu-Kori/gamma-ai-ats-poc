import type { CSSProperties } from "react";

export const DEFAULT_RESUME_THEME = {
  accent: "#2563eb",
  fontHeading: '"Inter", sans-serif',
  fontBody: '"Inter", sans-serif',
} as const;

export const ACCENT_COLORS = [
  { id: "blue", value: "#2563eb", className: "bg-blue-600" },
  { id: "slate", value: "#0f172a", className: "bg-slate-900" },
  { id: "emerald", value: "#059669", className: "bg-emerald-600" },
  { id: "violet", value: "#7c3aed", className: "bg-violet-600" },
  { id: "rose", value: "#e11d48", className: "bg-rose-600" },
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
    id: "merriweather",
    label: "Merriweather",
    fontHeading: '"Merriweather", serif',
    fontBody: '"Merriweather", serif',
    sampleClassName: "font-serif",
  },
] as const;

export function resumeThemeToCssVars(theme: Record<string, string>) {
  return {
    "--color-accent": theme.accent ?? DEFAULT_RESUME_THEME.accent,
    "--font-heading": theme.fontHeading ?? DEFAULT_RESUME_THEME.fontHeading,
    "--font-body": theme.fontBody ?? DEFAULT_RESUME_THEME.fontBody,
  } as CSSProperties;
}

export function getActiveFontId(theme: Record<string, string>) {
  return (
    FONT_OPTIONS.find((f) => f.fontHeading === theme.fontHeading)?.id ?? "inter"
  );
}

export function getActiveAccentId(theme: Record<string, string>) {
  return ACCENT_COLORS.find((c) => c.value === theme.accent)?.id ?? "blue";
}
