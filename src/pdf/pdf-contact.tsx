import { Text, View } from "@react-pdf/renderer";

import { getOrderedContactKeys } from "@/lib/contact-order";
import type { ContactInfo, ContactKey } from "@/lib/types/resume";

import type { PdfStyles } from "./create-pdf-styles";

const CONTACT_LABELS: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin: "LinkedIn",
  github: "GitHub",
  website: "Website",
};

export function PdfContactInline({
  contact,
  order,
  styles,
  tone = "default",
}: {
  contact: ContactInfo;
  order?: ContactKey[] | null;
  styles: PdfStyles;
  tone?: "default" | "onAccent" | "sidebar" | "left";
}) {
  const keys = getOrderedContactKeys(contact, order);
  if (!keys.length) return null;

  const lineStyle =
    tone === "onAccent"
      ? styles.contactOnAccent
      : tone === "sidebar"
        ? styles.contactSidebar
        : tone === "left"
          ? styles.contactLeft
          : styles.contact;

  return <Text style={lineStyle}>{keys.map((k) => contact[k]?.trim()).filter(Boolean).join("  •  ")}</Text>;
}

export function PdfContactSidebar({
  contact,
  order,
  styles,
  inverted = false,
}: {
  contact: ContactInfo;
  order?: ContactKey[] | null;
  styles: PdfStyles;
  inverted?: boolean;
}) {
  const keys = getOrderedContactKeys(contact, order);
  if (!keys.length) return null;

  const labelStyle = inverted ? styles.sidebarLabelOnAccent : styles.sidebarLabel;
  const valueStyle = inverted ? styles.sidebarValueOnAccent : styles.sidebarValue;

  return (
    <View>
      <Text style={labelStyle}>Contact</Text>
      {keys.map((key) => {
        const value = contact[key]?.trim();
        if (!value) return null;
        return (
          <View key={key} style={styles.sidebarContactItem}>
            <Text style={labelStyle}>{CONTACT_LABELS[key] ?? key}</Text>
            <Text style={valueStyle}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
}
