"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Code2,
  Globe,
  Link2,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import {
  getOrderedContactKeys,
  isContactKey,
  type ContactKey,
} from "@/lib/contact-order";
import type { ContactInfo } from "@/lib/types/resume";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";

import {
  SortableContactItem,
  type ContactItemLayout,
} from "./sortable-contact-item";

const CONTACT_META: Record<
  ContactKey,
  { icon: LucideIcon; label: string }
> = {
  email: { icon: Mail, label: "Email" },
  phone: { icon: Phone, label: "Phone" },
  location: { icon: MapPin, label: "Location" },
  linkedin: { icon: Link2, label: "LinkedIn" },
  github: { icon: Code2, label: "GitHub" },
  website: { icon: Globe, label: "Website" },
};

const LAYOUT_CLASS: Record<ContactItemLayout, string> = {
  inline:
    "resume-contact resume-contact-inline flex list-none flex-wrap items-center justify-start gap-x-4 gap-y-1",
  bar: "resume-contact resume-contact-bar text-muted-foreground mt-3 flex list-none flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm",
  sidebar: "resume-contact resume-contact-sidebar list-none space-y-3 p-0",
  chips:
    "resume-contact resume-contact-chips flex min-w-0 w-full list-none flex-wrap items-center gap-y-2 p-0",
};

type SortableContactListProps = {
  contact: ContactInfo;
  layout: ContactItemLayout;
  className?: string;
  onAccent?: boolean;
  keys?: ContactKey[];
};

export function SortableContactList({
  contact,
  layout,
  className,
  onAccent = false,
  keys,
}: SortableContactListProps) {
  const contactOrder = useResumeStore((s) => s.resume?.contactOrder);
  const reorderContact = useResumeStore((s) => s.reorderContact);
  const triggerAutosave = useDebouncedAutosave();

  const orderedKeys = useMemo(
    () => getOrderedContactKeys(contact, contactOrder, keys),
    [contact, contactOrder, keys],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!orderedKeys.length) return null;

  const strategy =
    layout === "sidebar"
      ? verticalListSortingStrategy
      : layout === "inline" || layout === "bar"
        ? horizontalListSortingStrategy
        : layout === "chips"
          ? rectSortingStrategy
          : horizontalListSortingStrategy;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const fromKey = String(active.id);
    const toKey = String(over?.id ?? "");
    if (over && active.id !== over.id && isContactKey(fromKey) && isContactKey(toKey)) {
      reorderContact(fromKey, toKey);
      triggerAutosave();
    }
  };

  return (
    <DndContext
      id={`contact-dnd-${layout}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={orderedKeys} strategy={strategy}>
        <ul
          className={cn(
            LAYOUT_CLASS[layout],
            onAccent && "resume-contact-on-accent",
            className,
          )}
        >
          {orderedKeys.map((key, index) => {
            const meta = CONTACT_META[key];
            return (
              <SortableContactItem
                key={key}
                id={key}
                icon={meta.icon}
                label={meta.label}
                layout={layout}
                showSeparator={layout === "bar" && index > 0}
                onAccent={onAccent}
              />
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
