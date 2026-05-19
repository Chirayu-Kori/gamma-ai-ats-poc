import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { getPageSizePt } from "../pdf-utils";

export function SingleColumnPdfLayout({
  resume,
  theme,
  templateId,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;
  const isClassic = templateId === "classic";

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.header}>
        {isClassic ? <View style={styles.classicRule} /> : null}
        {resume.name?.trim() ? (
          <Text style={styles.name}>{resume.name.trim()}</Text>
        ) : null}
        {resume.headline?.trim() ? (
          <Text style={styles.headline}>{resume.headline.trim()}</Text>
        ) : null}
        <PdfContactInline contact={contact} order={resume.contactOrder} styles={styles} />
        {isClassic ? <View style={styles.classicRule} /> : null}
      </View>
      <PdfSectionsList resume={resume} styles={styles} />
    </Page>
  );
}
