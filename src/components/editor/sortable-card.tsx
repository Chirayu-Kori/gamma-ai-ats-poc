"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, ArrowUp, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortableCardProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onSelect?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
};

export function SortableCard({
  id,
  children,
  className,
  selected = false,
  onSelect,
  onAdd,
  onDelete,
  onMoveUp,
}: SortableCardProps) {
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: open });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : open ? 40 : 1,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative -mx-2 flex gap-1 rounded-md transition-colors",
        isDragging ? "bg-accent/50" : "hover:bg-slate-100/10",
        className,
      )}
    >
      <CardActions
        open={open}
        onOpenChange={setOpen}
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
        onAdd={onAdd}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
      />
      <div
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect}
        onKeyDown={
          onSelect
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect();
                }
              }
            : undefined
        }
        className={cn(
          "min-w-0 flex-1 rounded-lg border transition-colors",
          selected
            ? "border-indigo-400 bg-blue-50/40 shadow-sm"
            : "border-transparent",
          onSelect &&
            "cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none",
          isDragging && "pointer-events-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface CardActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDragging: boolean;
  attributes: any;
  listeners: any;
  onAdd?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
}

function CardActions({
  open,
  onOpenChange,
  isDragging,
  attributes,
  listeners,
  onAdd,
  onDelete,
  onMoveUp,
}: CardActionsProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-muted-foreground mt-1 shrink-0 cursor-grab touch-none rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing data-[state=open]:opacity-100",
            isDragging && "opacity-100",
          )}
          {...attributes}
          {...listeners}
          onClick={(e) => {
            e.stopPropagation();
            if (isDragging) return;
            onOpenChange(true);
          }}
          aria-label="Card actions"
        >
          <GripVertical className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        className="border-border flex w-auto min-w-0 flex-row gap-0.5 rounded-lg bg-white/95 p-1 shadow-2xl backdrop-blur-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
          className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-blue-50 hover:text-blue-600"
          title="Add Below"
        >
          <Plus className="size-4" />
        </DropdownMenuItem>

        {onMoveUp && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-slate-100"
            title="Move Up"
          >
            <ArrowUp className="size-4" />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="text-muted-foreground flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-rose-50 hover:text-rose-600"
          title="Delete Card"
        >
          <Trash2 className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
