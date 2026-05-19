import { Document } from "@react-pdf/renderer";

import { getLayoutForTemplate } from "@/lib/page-layout";
import type { TemplateLayout } from "@/components/templates/registry";

import { createPdfStyles } from "./create-pdf-styles";
import { BandHeaderPdfLayout } from "./layouts/band-header-layout";
import { CompactPdfLayout } from "./layouts/compact-layout";
import { SidebarLeftPdfLayout } from "./layouts/sidebar-left-layout";
import { SidebarRightPdfLayout } from "./layouts/sidebar-right-layout";
import { SingleColumnPdfLayout } from "./layouts/single-column-layout";
import { StripePdfLayout } from "./layouts/stripe-layout";
import type { ResumePdfProps } from "./types";

export type { ResumePdfProps };

export function ResumePdfDocument({ resume, theme, templateId }: ResumePdfProps) {
  const styles = createPdfStyles(theme, templateId);
  const layout = getLayoutForTemplate(templateId);
  const props = { resume, theme, templateId, styles };

  const page = renderLayout(layout, props);

  return (
    <Document title={resume.name || "Resume"} author={resume.name || undefined}>
      {page}
    </Document>
  );
}

function renderLayout(layout: TemplateLayout, props: ResumePdfProps & { styles: ReturnType<typeof createPdfStyles> }) {
  switch (layout) {
    case "sidebar-left":
      return <SidebarLeftPdfLayout {...props} />;
    case "sidebar-right":
      return <SidebarRightPdfLayout {...props} />;
    case "band-header":
      return <BandHeaderPdfLayout {...props} />;
    case "stripe":
      return <StripePdfLayout {...props} />;
    case "two-column":
      return <CompactPdfLayout {...props} />;
    case "single":
    default:
      return <SingleColumnPdfLayout {...props} />;
  }
}
