"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, type LucideIcon } from "lucide-react";

import { EditableText } from "./EditableText";
import type { ContactKey } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

export type ContactItemLayout = "inline" | "bar" | "sidebar" | "chips";

type SortableContactItemProps = {
  id: ContactKey;
  icon: LucideIcon;
  label: string;
  layout: ContactItemLayout;
  showSeparator?: boolean;
  onAccent?: boolean;
};

function ContactIcon({
  icon: Icon,
  className,
  onAccent,
}: {
  icon: LucideIcon;
  className?: string;
  onAccent?: boolean;
}) {
  return (
    <Icon
      className={cn(
        "resume-contact-icon size-3.5 shrink-0",
        onAccent && "text-white/90",
        className,
      )}
      strokeWidth={2}
      aria-hidden
    />
  );
}

export function SortableContactItem({
  id,
  icon: Icon,
  label,
  layout,
  showSeparator = false,
  onAccent = false,
}: SortableContactItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.85 : 1,
  };

  const grip = (
    <button
      type="button"
      className={cn(
        "text-muted-foreground shrink-0 cursor-grab touch-none rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing",
        onAccent && "text-white/70",
        isDragging && "opacity-100",
      )}
      {...attributes}
      {...listeners}
      aria-label={`Drag ${label}`}
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="size-3.5" />
    </button>
  );

  if (layout === "sidebar") {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative min-w-0 list-none",
          isDragging && "bg-accent/30 rounded-md",
        )}
      >
        <div className="flex gap-1">
          {grip}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-medium tracking-wide opacity-70 uppercase">
              <ContactIcon icon={Icon} className="size-3" onAccent={onAccent} />
              <span>{label}</span>
            </div>
            <EditableText
              path={`contact.${id}`}
              mode="inline"
              inlineWrap
              className="resume-contact-value block text-sm break-words"
              editorClassName="whitespace-normal break-words"
            />
          </div>
        </div>
      </li>
    );
  }

  if (layout === "chips") {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex min-w-0 max-w-full list-none items-center gap-1 rounded-full px-2 py-1",
          isDragging && "bg-accent/40",
        )}
      >
        {grip}
        <ContactIcon icon={Icon} className="size-3" onAccent={onAccent} />
        <EditableText
          path={`contact.${id}`}
          mode="inline"
          inlineWrap
          className="resume-contact-value min-w-0 text-sm break-words"
          editorClassName="whitespace-normal break-words"
        />
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex w-max max-w-none shrink-0 list-none items-center gap-1.5",
        isDragging && "rounded-md bg-accent/30",
      )}
    >
      {showSeparator ? (
        <span
          className={cn(
            "text-border mx-0.5 hidden shrink-0 text-xs sm:inline",
            onAccent && "text-white/50",
          )}
          aria-hidden
        >
          •
        </span>
      ) : null}
      {grip}
      <ContactIcon icon={Icon} onAccent={onAccent} />
      <EditableText
        path={`contact.${id}`}
        mode="inline"
        className={cn(
          "resume-contact-value max-w-none! w-max leading-tight whitespace-nowrap",
          layout === "bar" && "text-center",
        )}
        editorClassName="whitespace-nowrap leading-tight py-0"
      />
    </li>
  );
}
