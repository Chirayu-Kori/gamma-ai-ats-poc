import type { ContactInfo } from "@/lib/types/resume";

export type ContactKey = keyof ContactInfo;

export const DEFAULT_CONTACT_ORDER: ContactKey[] = [
  "email",
  "phone",
  "location",
  "linkedin",
  "github",
  "website",
];

export function isContactKey(value: string): value is ContactKey {
  return DEFAULT_CONTACT_ORDER.includes(value as ContactKey);
}

export function hasContactValue(
  contact: ContactInfo,
  key: ContactKey,
): boolean {
  const value = contact[key];
  return value != null && String(value).trim() !== "";
}

/** Visible contact fields in display order. */
export function getOrderedContactKeys(
  contact: ContactInfo,
  order: ContactKey[] | null | undefined,
  allowed?: ContactKey[],
): ContactKey[] {
  const allowedSet = allowed ? new Set(allowed) : null;
  const baseOrder = (order?.length ? order : DEFAULT_CONTACT_ORDER).filter(
    isContactKey,
  );

  const seen = new Set<ContactKey>();
  const result: ContactKey[] = [];

  for (const key of baseOrder) {
    if (allowedSet && !allowedSet.has(key)) continue;
    if (!hasContactValue(contact, key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }

  for (const key of DEFAULT_CONTACT_ORDER) {
    if (allowedSet && !allowedSet.has(key)) continue;
    if (!hasContactValue(contact, key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }

  return result;
}

/** Persisted order — all known keys, not filtered by empty values. */
export function normalizeContactOrder(
  order: ContactKey[] | null | undefined,
): ContactKey[] {
  const merged: ContactKey[] = [];
  const seen = new Set<ContactKey>();

  for (const key of order ?? []) {
    if (!isContactKey(key) || seen.has(key)) continue;
    seen.add(key);
    merged.push(key);
  }

  for (const key of DEFAULT_CONTACT_ORDER) {
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(key);
  }

  return merged;
}
