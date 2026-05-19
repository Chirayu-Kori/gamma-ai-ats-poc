import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { getPageSizePt } from "../pdf-utils";

export function BandHeaderPdfLayout({
  resume,
  theme,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.headerBand}>
        {resume.name?.trim() ? (
          <Text style={styles.nameOnAccent}>{resume.name.trim()}</Text>
        ) : null}
        {resume.headline?.trim() ? (
          <Text style={styles.headlineOnAccent}>{resume.headline.trim()}</Text>
        ) : null}
        <PdfContactInline
          contact={contact}
          order={resume.contactOrder}
          styles={styles}
          tone="onAccent"
        />
      </View>
      <View style={styles.pageInner}>
        <PdfSectionsList resume={resume} styles={styles} />
      </View>
    </Page>
  );
}
