import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSectionsList } from "../pdf-sections";
import type { ResumePdfProps } from "../types";
import { formatPdfInlineText, getPageSizePt } from "../pdf-utils";

export function StripePdfLayout({
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
      <View style={styles.pageRow}>
        <View style={styles.stripeBar} />
        <View style={styles.stripeContent}>
          <View style={styles.headerLeft}>
            {name ? <Text style={styles.nameAlignLeft}>{name}</Text> : null}
            {headline ? (
              <Text style={styles.headlineAlignLeft}>{headline}</Text>
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
