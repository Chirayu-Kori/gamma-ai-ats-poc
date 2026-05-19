"use client";

import type { ContactInfo, ContactKey } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { SortableContactList } from "@/components/editor/sortable-contact-list";

export type { ContactKey };

/** Horizontal row — drag to reorder; icons use theme accent. */
export function ResumeContactInline({
  contact,
  className,
  onAccent = false,
  keys,
}: {
  contact: ContactInfo;
  className?: string;
  onAccent?: boolean;
  keys?: ContactKey[];
}) {
  return (
    <SortableContactList
      contact={contact}
      layout="inline"
      className={cn("justify-start gap-x-4", className)}
      onAccent={onAccent}
      keys={keys}
    />
  );
}

/** Centered bar with icons — drag to reorder. */
export function ResumeContactBar({
  contact,
  className,
}: {
  contact: ContactInfo;
  className?: string;
}) {
  return (
    <SortableContactList contact={contact} layout="bar" className={className} />
  );
}

/** Sidebar stack (modern / atlantic). */
export function ResumeContactSidebar({
  contact,
  className,
  keys,
  onAccent = false,
}: {
  contact: ContactInfo;
  className?: string;
  keys?: ContactKey[];
  onAccent?: boolean;
}) {
  return (
    <SortableContactList
      contact={contact}
      layout="sidebar"
      className={className}
      keys={keys}
      onAccent={onAccent}
    />
  );
}

/** Chip row (creative). */
export function ResumeContactChips({
  contact,
  className,
  chipClassName,
  keys,
}: {
  contact: ContactInfo;
  className?: string;
  chipClassName?: string;
  keys?: ContactKey[];
}) {
  return (
    <SortableContactList
      contact={contact}
      layout="chips"
      className={cn(chipClassName, className)}
      keys={keys}
    />
  );
}
