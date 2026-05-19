import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSection, PdfSectionsList } from "../pdf-sections";
import { getPdfSections } from "../section-utils";
import type { ResumePdfProps } from "../types";
import { getPageSizePt } from "../pdf-utils";

export function SidebarRightPdfLayout({
  resume,
  theme,
  styles,
}: ResumePdfProps & { styles: PdfStyles }) {
  const pageSize = getPageSizePt(theme);
  const contact = (resume.contact ?? {}) as ContactInfo;
  const sidebarSections = getPdfSections(resume, {
    includeTypes: ["skills", "certifications"],
  });

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <View style={styles.creativeAccentBar} />
      <View style={{ paddingHorizontal: 40, paddingTop: 24, paddingBottom: 8 }}>
        {resume.name?.trim() ? (
          <Text style={styles.nameAlignLeft}>{resume.name.trim()}</Text>
        ) : null}
        {resume.headline?.trim() ? (
          <Text style={styles.headlineAlignLeft}>{resume.headline.trim()}</Text>
        ) : null}
        <PdfContactInline contact={contact} order={resume.contactOrder} styles={styles} />
      </View>
      <View style={styles.bodyColumns}>
        <View style={styles.mainColumnPlain}>
          <PdfSectionsList
            resume={resume}
            styles={styles}
            excludeTypes={["skills", "certifications"]}
          />
        </View>
        {sidebarSections.length > 0 ? (
          <View style={styles.sidebarRight}>
            {sidebarSections.map((section) => (
              <PdfSection
                key={section.id}
                section={section}
                resume={resume}
                styles={styles}
                compactTitle
              />
            ))}
          </View>
        ) : null}
      </View>
    </Page>
  );
}
