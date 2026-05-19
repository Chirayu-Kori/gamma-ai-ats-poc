import {
  TEMPLATES,
  type TemplateLayout,
} from "@/components/templates/registry";

export type { PageFormatId as PageFormat } from "@/lib/page-size";
export {
  PAGE_FORMAT_OPTIONS,
  PAGE_SIZE_PRESETS,
} from "@/lib/page-size";

export const PAGE_LAYOUT_OPTIONS: {
  id: TemplateLayout;
  label: string;
  description: string;
}[] = [
  {
    id: "single",
    label: "Single column",
    description: "Classic one-column flow",
  },
  {
    id: "sidebar-left",
    label: "Left sidebar",
    description: "Contact and skills on the left",
  },
  {
    id: "sidebar-right",
    label: "Right sidebar",
    description: "Accent column on the right",
  },
  {
    id: "band-header",
    label: "Header band",
    description: "Full-width colored header",
  },
  {
    id: "stripe",
    label: "Accent stripe",
    description: "Vertical accent bar",
  },
  {
    id: "two-column",
    label: "Two column",
    description: "Split body into two columns",
  },
];

/** Default template that best represents each structural layout. */
export function getDefaultTemplateForLayout(layout: TemplateLayout): string {
  const preferred: Partial<Record<TemplateLayout, string>> = {
    single: "minimal",
    "sidebar-left": "modern",
    "sidebar-right": "creative",
    "band-header": "bold",
    stripe: "stripe",
    "two-column": "compact",
  };
  const id = preferred[layout];
  if (id && TEMPLATES[id]) return id;
  const fallback = Object.entries(TEMPLATES).find(([, tpl]) => tpl.layout === layout);
  return fallback?.[0] ?? "minimal";
}

export function getLayoutForTemplate(templateId: string): TemplateLayout {
  return TEMPLATES[templateId]?.layout ?? "single";
}

export function getPageLayoutLabel(layout: TemplateLayout): string {
  return PAGE_LAYOUT_OPTIONS.find((opt) => opt.id === layout)?.label ?? layout;
}
