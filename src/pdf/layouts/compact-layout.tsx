import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { getPageSizePt } from "../pdf-utils";

export function CompactPdfLayout({
  resume,
  theme,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.compactHeaderRow}>
        {resume.name?.trim() ? (
          <Text style={styles.nameLeft}>{resume.name.trim()}</Text>
        ) : null}
        {resume.headline?.trim() ? (
          <Text style={styles.headlineLeft}>{resume.headline.trim()}</Text>
        ) : null}
      </View>
      <PdfContactInline contact={contact} order={resume.contactOrder} styles={styles} />
      <PdfSectionsList resume={resume} styles={styles} compactTitles />
    </Page>
  );
}
