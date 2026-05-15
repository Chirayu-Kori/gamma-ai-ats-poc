"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditableText } from "./EditableText";
import { GripVertical } from "lucide-react";

interface SortableBulletProps {
  id: string; // The dnd-kit item id
  expIdx: number;
  bulletIdx: number;
  section: "experience" | "projects";
}

export function SortableBullet({ id, expIdx, bulletIdx, section }: SortableBulletProps) {
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
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-start -ml-6 pl-2 pr-2 py-1 rounded relative ${
        isDragging ? "bg-accent/50" : "hover:bg-accent/10"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="opacity-0 group-hover:opacity-100 mt-1 cursor-grab active:cursor-grabbing text-muted-foreground mr-2 shrink-0 transition-opacity"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1">
        <EditableText 
          path={`${section}.${expIdx}.bullets.${bulletIdx}.text`} 
          className="outline-none focus:bg-accent/10 focus:ring-1 ring-accent px-1 rounded -ml-1 inline-block min-w-full"
        />
      </div>
    </li>
  );
}
