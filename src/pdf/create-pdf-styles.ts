import { StyleSheet } from "@react-pdf/renderer";

import { TEMPLATES } from "@/components/templates/registry";
import { mergeThemeDefaults } from "@/lib/resume-theme";
import { mapPdfFontFamily, mixAccentBorder, mixAccentColor } from "./pdf-utils";

export function createPdfStyles(theme: Record<string, string>, templateId: string) {
  const t = mergeThemeDefaults(theme);
  const bodyFont = mapPdfFontFamily(t.fontBody);
  const headingFont = mapPdfFontFamily(t.fontHeading);
  const mutedText = "#64748b";
  const tpl = TEMPLATES[templateId] ?? TEMPLATES.minimal;
  const layout = tpl.layout;

  const isExecutive = templateId === "executive";
  const isClassic = templateId === "classic";
  const isModern = templateId === "modern";
  const isCreative = templateId === "creative" || layout === "sidebar-right";
  const isStripe = layout === "stripe";
  const isBandHeader = layout === "band-header";
  const pagePaddingHorizontal =
    isStripe || isBandHeader || isCreative ? 0 : 44;
  const pagePaddingTop = isBandHeader || isCreative ? 0 : isStripe ? 0 : 40;
  const pagePaddingBottom = isCreative ? 0 : 40;

  const base = StyleSheet.create({
    page: {
      paddingTop: pagePaddingTop,
      paddingBottom: pagePaddingBottom,
      paddingHorizontal: pagePaddingHorizontal,
      fontFamily: bodyFont,
      fontSize: 10,
      color: t.textColor,
      backgroundColor: t.backgroundColor,
    },
    pageInner: {
      paddingHorizontal: 44,
      paddingTop: 32,
      paddingBottom: 32,
    },
    pageRow: {
      flexDirection: "row",
      minHeight: "100%",
    },
    header: {
      marginBottom: 20,
      alignItems: "center",
    },
    headerLeft: {
      marginBottom: 14,
      alignItems: "flex-start",
    },
    headerBand: {
      backgroundColor: t.accent,
      paddingVertical: 28,
      paddingHorizontal: 44,
      marginBottom: 24,
    },
    name: {
      fontFamily: headingFont,
      fontSize: isExecutive ? 22 : 20,
      fontWeight: 700,
      color: isExecutive || isClassic ? t.headingColor : t.headingColor,
      textAlign: "center",
      lineHeight: 1.35,
      marginBottom: 8,
      textTransform: isExecutive ? "uppercase" : "none",
      letterSpacing: isExecutive ? 1 : 0,
    },
    nameLeft: {
      fontFamily: headingFont,
      fontSize: 18,
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: 1.35,
      marginBottom: 4,
    },
    nameAlignLeft: {
      fontFamily: headingFont,
      fontSize: 20,
      fontWeight: 700,
      color: t.headingColor,
      textAlign: "left",
      lineHeight: 1.35,
      marginBottom: 8,
    },
    headlineAlignLeft: {
      fontSize: 11,
      color: mutedText,
      textAlign: "left",
      lineHeight: 1.45,
      marginBottom: 8,
    },
    nameOnAccent: {
      fontFamily: headingFont,
      fontSize: 24,
      fontWeight: 700,
      color: "#ffffff",
      lineHeight: 1.3,
      marginBottom: 6,
    },
    nameSidebar: {
      fontFamily: headingFont,
      fontSize: isModern ? 16 : 14,
      fontWeight: 700,
      color: isModern ? "#ffffff" : t.headingColor,
      lineHeight: 1.35,
      marginBottom: 6,
    },
    headline: {
      fontSize: 11,
      color: mutedText,
      textAlign: "center",
      lineHeight: 1.45,
      marginBottom: 8,
      textTransform: isExecutive ? "uppercase" : isClassic ? "uppercase" : "none",
      letterSpacing: isClassic || isExecutive ? 1 : 0,
    },
    headlineLeft: {
      fontSize: 9,
      color: mutedText,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      lineHeight: 1.4,
    },
    headlineOnAccent: {
      fontSize: 11,
      color: "#e2e8f0",
      lineHeight: 1.45,
      marginBottom: 8,
    },
    headlineSidebar: {
      fontSize: 9,
      color: isModern ? "#cbd5e1" : mutedText,
      lineHeight: 1.45,
      marginBottom: 12,
    },
    contact: {
      fontSize: 9,
      color: mutedText,
      textAlign: "center",
      lineHeight: 1.55,
    },
    contactLeft: {
      fontSize: 9,
      color: mutedText,
      textAlign: "left",
      lineHeight: 1.55,
      marginTop: 4,
    },
    contactOnAccent: {
      fontSize: 9,
      color: "#e2e8f0",
      lineHeight: 1.55,
    },
    contactSidebar: {
      fontSize: 8.5,
      color: isModern ? "#e2e8f0" : t.textColor,
      lineHeight: 1.5,
    },
    classicRule: {
      borderTopWidth: 1,
      borderTopColor: t.accent,
      borderTopStyle: "solid",
      width: "60%",
      alignSelf: "center",
      marginVertical: 8,
    },
    stripeBar: {
      width: 10,
      backgroundColor: t.accent,
    },
    stripeContent: {
      flex: 1,
      paddingVertical: 36,
      paddingHorizontal: 40,
    },
    creativeAccentBar: {
      height: 6,
      backgroundColor: t.accent,
      width: "100%",
    },
    creativeHeader: {
      paddingHorizontal: 36,
      paddingTop: 28,
      paddingBottom: 10,
    },
    creativeBodyColumns: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 18,
      paddingHorizontal: 36,
      paddingBottom: 28,
    },
    creativeMainColumn: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
    },
    creativeSidebarColumn: {
      width: 210,
      flexGrow: 0,
      flexShrink: 0,
    },
    creativeSidebarAsidePanel: {
      position: "absolute",
      right: 36,
      width: 210,
      top: 28,
      bottom: 28,
      backgroundColor: mixAccentColor(t.accent, 0.08),
      borderWidth: 1,
      borderColor: mixAccentBorder(t.accent, 0.2),
      borderStyle: "solid",
      borderRadius: 10,
    },
    creativeSidebarContent: {
      width: 210,
      paddingVertical: 18,
      paddingHorizontal: 18,
    },
    creativeSidebarSectionGap: {
      marginBottom: 14,
    },
    creativeSidebarSectionTitle: {
      fontFamily: headingFont,
      fontSize: 7,
      fontWeight: 700,
      color: t.accent,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      lineHeight: 1.35,
      marginBottom: 6,
    },
    sectionSidebarInner: {
      marginTop: 0,
      marginBottom: 0,
    },
    sidebarDark: {
      width: "32%",
      backgroundColor: t.sidebarColor || t.accent,
      paddingVertical: 28,
      paddingHorizontal: 20,
    },
    sidebarLight: {
      width: "30%",
      backgroundColor: "#f8fafc",
      borderRightWidth: 1,
      borderRightColor: "#e2e8f0",
      borderRightStyle: "solid",
      paddingVertical: 28,
      paddingHorizontal: 18,
    },
    sidebarRight: {
      width: "32%",
      maxWidth: 210,
      backgroundColor: "#f1f5f9",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    mainColumn: {
      flex: 1,
      paddingVertical: 28,
      paddingHorizontal: 28,
    },
    mainColumnPlain: {
      flex: 1,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    bodyColumns: {
      flexDirection: "row",
      gap: 20,
      paddingHorizontal: 40,
      paddingBottom: 32,
    },
    sidebarLabel: {
      fontSize: 8,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: mutedText,
      marginBottom: 4,
    },
    sidebarLabelOnAccent: {
      fontSize: 8,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      color: "#cbd5e1",
      marginBottom: 4,
    },
    sidebarValue: {
      fontSize: 8.5,
      color: t.textColor,
      lineHeight: 1.45,
      marginBottom: 6,
    },
    sidebarValueOnAccent: {
      fontSize: 8.5,
      color: "#f8fafc",
      lineHeight: 1.45,
      marginBottom: 6,
    },
    sidebarContactItem: {
      marginBottom: 6,
    },
    compactHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      borderBottomStyle: "solid",
      paddingBottom: 8,
    },
    section: {
      marginTop: 14,
      marginBottom: 2,
    },
    sectionCompact: {
      marginTop: 10,
      marginBottom: 0,
    },
    sectionTitleWrap: {
      marginBottom: 10,
    },
    sectionTitleText: {
      fontFamily: headingFont,
      fontSize: 10,
      fontWeight: 700,
      color: t.accent,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      lineHeight: 1.4,
      marginBottom: 5,
    },
    sectionTitleCompact: {
      fontFamily: headingFont,
      fontSize: 9,
      fontWeight: 700,
      color: t.accent,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      lineHeight: 1.35,
      marginBottom: 4,
    },
    sectionTitleExecutive: {
      fontFamily: headingFont,
      fontSize: 9,
      fontWeight: 700,
      color: t.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      lineHeight: 1.4,
      marginBottom: 5,
      borderBottomWidth: 2,
      borderBottomColor: t.accent,
      borderBottomStyle: "solid",
      paddingBottom: 3,
    },
    sectionTitleRule: {
      borderBottomWidth: 1,
      borderBottomColor: t.accent,
      borderBottomStyle: "solid",
      width: "100%",
    },
    bodyText: {
      fontSize: 10,
      color: t.textColor,
      lineHeight: 1.55,
      marginBottom: 8,
    },
    bodyTextSpaced: {
      fontSize: 10,
      color: t.textColor,
      lineHeight: 1.55,
      marginTop: 6,
      marginBottom: 8,
    },
    subsection: {
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
      width: "100%",
    },
    rowLeft: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      paddingRight: 12,
    },
    rowRight: {
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: "38%",
    },
    blockTitle: {
      fontSize: 10.5,
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: 1.4,
      marginBottom: 4,
    },
    rowTitle: {
      fontSize: 10.5,
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: 1.4,
    },
    rowMeta: {
      fontSize: 9,
      color: mutedText,
      textAlign: "right",
      lineHeight: 1.4,
    },
    rowSubtitle: {
      fontSize: 9.5,
      fontStyle: "italic",
      color: t.textColor,
      lineHeight: 1.45,
      marginBottom: 5,
    },
    bullet: {
      fontSize: 9.5,
      color: t.textColor,
      lineHeight: 1.5,
      marginBottom: 4,
      paddingLeft: 12,
    },
    skillCategory: {
      fontSize: 10,
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: 1.4,
      marginBottom: 3,
    },
    skillItems: {
      fontSize: 9.5,
      color: t.textColor,
      lineHeight: 1.5,
      marginBottom: 8,
    },
    skillRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      width: "100%",
      marginBottom: 6,
    },
    skillRowCategory: {
      width: 128,
      flexShrink: 0,
      paddingRight: 12,
    },
    skillRowItems: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
    },
    skillCategoryRow: {
      fontSize: 10,
      fontWeight: 700,
      color: t.headingColor,
      lineHeight: 1.45,
    },
    skillItemsRow: {
      fontSize: 9.5,
      color: t.textColor,
      lineHeight: 1.5,
    },
    skillGroupStacked: {
      marginBottom: 8,
    },
    skillPillGroup: {
      marginBottom: 10,
    },
    skillPillCategory: {
      fontSize: 7.5,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: t.accent,
      marginBottom: 5,
    },
    skillPillWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      width: "100%",
    },
    skillPill: {
      maxWidth: "100%",
      alignSelf: "flex-start",
      paddingVertical: 2,
      paddingHorizontal: 7,
      borderRadius: 50,
      backgroundColor: mixAccentColor(t.accent, 0.12),
      borderWidth: 1,
      borderColor: mixAccentBorder(t.accent, 0.22),
      borderStyle: "solid",
    },
    skillPillText: {
      fontSize: 7.5,
      lineHeight: 1.35,
      color: t.textColor,
    },
  });

  if (templateId === "executive") {
    return {
      ...base,
      sectionTitleText: base.sectionTitleExecutive,
    };
  }

  return base;
}

export type PdfStyles = ReturnType<typeof createPdfStyles>;
