import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactSidebar } from "../pdf-contact";
import { PdfSection, PdfSectionsList } from "../pdf-sections";
import { findPdfSection } from "../section-utils";
import type { ResumePdfProps } from "../types";
import { formatPdfInlineText, getPageSizePt } from "../pdf-utils";

export function SidebarLeftPdfLayout({
  resume,
  theme,
  templateId,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;
  const isModern = templateId === "modern";
  const skillsSection = findPdfSection(resume, "skills");
  const name = formatPdfInlineText(resume.name);
  const headline = formatPdfInlineText(resume.headline);

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.pageRow}>
        <View style={isModern ? styles.sidebarDark : styles.sidebarLight}>
          {name ? <Text style={styles.nameSidebar}>{name}</Text> : null}
          {headline ? <Text style={styles.headlineSidebar}>{headline}</Text> : null}
          <PdfContactSidebar
            contact={contact}
            order={resume.contactOrder}
            styles={styles}
            inverted={isModern}
          />
          {skillsSection && (resume.skills?.length ?? 0) > 0 ? (
            <View style={{ marginTop: 14 }}>
              <PdfSection section={skillsSection} resume={resume} styles={styles} compactTitle />
            </View>
          ) : null}
        </View>
        <View style={styles.mainColumn}>
          <PdfSectionsList resume={resume} styles={styles} excludeTypes={["skills"]} />
        </View>
      </View>
    </Page>
  );
}
