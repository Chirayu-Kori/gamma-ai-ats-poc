import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { formatPdfInlineText, getPageSizePt } from "../pdf-utils";

export function SingleColumnPdfLayout({
  resume,
  theme,
  templateId,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;
  const isClassic = templateId === "classic";
  const name = formatPdfInlineText(resume.name);
  const headline = formatPdfInlineText(resume.headline);

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.header}>
        {isClassic ? <View style={styles.classicRule} /> : null}
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {headline ? <Text style={styles.headline}>{headline}</Text> : null}
        <PdfContactInline contact={contact} order={resume.contactOrder} styles={styles} />
        {isClassic ? <View style={styles.classicRule} /> : null}
      </View>
      <PdfSectionsList resume={resume} styles={styles} />
    </Page>
  );
}
