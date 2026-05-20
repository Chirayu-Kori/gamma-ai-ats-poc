import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { formatPdfInlineText, getPageSizePt } from "../pdf-utils";

export function CompactPdfLayout({
  resume,
  theme,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;
  const name = formatPdfInlineText(resume.name);
  const headline = formatPdfInlineText(resume.headline);

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.compactHeaderRow}>
        {name ? <Text style={styles.nameLeft}>{name}</Text> : null}
        {headline ? <Text style={styles.headlineLeft}>{headline}</Text> : null}
      </View>
      <PdfContactInline contact={contact} order={resume.contactOrder} styles={styles} />
      <PdfSectionsList resume={resume} styles={styles} compactTitles />
    </Page>
  );
}
