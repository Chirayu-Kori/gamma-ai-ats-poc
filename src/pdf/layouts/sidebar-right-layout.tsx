import { Page, Text, View } from "@react-pdf/renderer";

import type { ContactInfo, ContactKey } from "@/lib/types/resume";

import type { PdfStyles } from "../create-pdf-styles";
import { PdfContactInline } from "../pdf-contact";
import { PdfSection, PdfSectionsList } from "../pdf-sections";
import { getPdfSections } from "../section-utils";
import type { ResumePdfProps } from "../types";
import { formatPdfInlineText, getPageSizePt } from "../pdf-utils";

function CreativePdfHeader({
  name,
  headline,
  contact,
  contactOrder,
  styles,
}: {
  name: string;
  headline: string;
  contact: ContactInfo;
  contactOrder?: ContactKey[] | null;
  styles: PdfStyles;
}) {
  return (
    <>
      <View style={styles.creativeAccentBar} />
      <View style={styles.creativeHeader}>
        {name ? <Text style={styles.nameAlignLeft}>{name}</Text> : null}
        {headline ? <Text style={styles.headlineAlignLeft}>{headline}</Text> : null}
        <PdfContactInline
          contact={contact}
          order={contactOrder}
          styles={styles}
          tone="left"
        />
      </View>
    </>
  );
}

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
  const name = formatPdfInlineText(resume.name);
  const headline = formatPdfInlineText(resume.headline);

  return (
    <Page size={pageSize} style={styles.page} wrap>
      <CreativePdfHeader
        name={name}
        headline={headline}
        contact={contact}
        contactOrder={resume.contactOrder}
        styles={styles}
      />
      <View style={styles.creativeBodyColumns} wrap>
        <View style={styles.creativeMainColumn} wrap>
          <PdfSectionsList
            resume={resume}
            styles={styles}
            excludeTypes={["skills", "certifications"]}
          />
        </View>
        {sidebarSections.length > 0 ? (
          <>
            <View fixed style={styles.creativeSidebarAsidePanel} />
            <View style={styles.creativeSidebarColumn} wrap>
              <View style={styles.creativeSidebarContent} wrap>
                {sidebarSections.map((section, index) => (
                  <View
                    key={section.id}
                    style={
                      index < sidebarSections.length - 1
                        ? styles.creativeSidebarSectionGap
                        : undefined
                    }
                    wrap
                  >
                    <PdfSection
                      section={section}
                      resume={resume}
                      styles={styles}
                      compactTitle
                      skillsPills={section.type === "skills"}
                      sidebarAside
                    />
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </View>
    </Page>
  );
}
