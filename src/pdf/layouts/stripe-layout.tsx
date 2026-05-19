import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { getPageSizePt } from "../pdf-utils";

export function StripePdfLayout({
  resume,
  theme,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.pageRow}>
        <View style={styles.stripeBar} />
        <View style={styles.stripeContent}>
          <View style={styles.headerLeft}>
            {resume.name?.trim() ? (
              <Text style={styles.nameAlignLeft}>{resume.name.trim()}</Text>
            ) : null}
            {resume.headline?.trim() ? (
              <Text style={styles.headlineAlignLeft}>{resume.headline.trim()}</Text>
            ) : null}
            <PdfContactInline
              contact={contact}
              order={resume.contactOrder}
              styles={styles}
            />
          </View>
          <PdfSectionsList resume={resume} styles={styles} />
        </View>
      </View>
    </Page>
  );
}
