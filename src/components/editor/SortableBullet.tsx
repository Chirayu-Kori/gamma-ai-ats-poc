"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { EditableText } from "./EditableText";

interface SortableBulletProps {
  id: string;
  expIdx: number;
  bulletIdx: number;
  section: "experience" | "projects";
}

export function SortableBullet({
  id,
  expIdx,
  bulletIdx,
  section,
}: SortableBulletProps) {
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
      className={`group relative flex items-start rounded px-2 py-1 ${
        isDragging ? "bg-accent/50" : "hover:bg-accent/10"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground mt-1 mr-1 shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </div>
      <span className="mt-[6px] mr-2.5 shrink-0 text-[8px] text-slate-400">
        ●
      </span>
      <div className="min-w-0 flex-1">
        <EditableText
          path={`${section}.${expIdx}.bullets.${bulletIdx}.text`}
          mode="inline"
          className="focus:bg-accent/10 ring-accent -ml-1 inline-block w-full rounded px-1 outline-none focus:ring-1"
        />
      </div>
    </li>
  );
}
