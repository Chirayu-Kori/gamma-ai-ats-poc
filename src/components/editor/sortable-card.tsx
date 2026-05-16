"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { GripVertical, Plus, ArrowUp, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DRAG_CLICK_THRESHOLD_PX = 8;

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
        listeners={open ? undefined : listeners}
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
  attributes: DraggableAttributes;
  listeners?: SyntheticListenerMap;
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
  const dragIntentRef = useRef(false);

  useEffect(() => {
    if (isDragging) dragIntentRef.current = true;
  }, [isDragging]);

  const trackDragIntent = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      dragIntentRef.current = false;
      const startX = e.clientX;
      const startY = e.clientY;
      const pointerId = e.pointerId;

      const onPointerMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) > DRAG_CLICK_THRESHOLD_PX) {
          dragIntentRef.current = true;
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [],
  );

  const handleGripPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      listeners?.onPointerDown?.(e);
      trackDragIntent(e);
    },
    [listeners, trackDragIntent],
  );

  const handleGripClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (dragIntentRef.current) {
        dragIntentRef.current = false;
        return;
      }
      onOpenChange(true);
    },
    [onOpenChange],
  );

  const runAction = useCallback(
    (action?: () => void) => {
      if (!action) return;
      action();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <div className="relative mt-1 shrink-0">
        {/* Invisible anchor for menu positioning — not the drag handle */}
        <DropdownMenuTrigger asChild>
          <span
            className="pointer-events-none absolute inset-0 block size-full"
            aria-hidden
          />
        </DropdownMenuTrigger>

        <button
          type="button"
          className={cn(
            "text-muted-foreground relative z-10 cursor-grab touch-none rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing data-[state=open]:opacity-100",
            open && "opacity-100",
            isDragging && "opacity-100",
          )}
          {...attributes}
          {...(listeners ?? {})}
          onPointerDown={handleGripPointerDown}
          onClick={handleGripClick}
          aria-label="Drag card or open actions"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      <DropdownMenuContent
        side="top"
        align="center"
        className="border-border flex w-auto min-w-0 flex-row gap-0.5 rounded-lg bg-white/95 p-1 shadow-2xl backdrop-blur-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          disabled={!onAdd}
          onSelect={() => runAction(onAdd)}
          className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-blue-50 hover:text-blue-600"
          title="Add Below"
        >
          <Plus className="size-4" />
        </DropdownMenuItem>

        {onMoveUp && (
          <DropdownMenuItem
            onSelect={() => runAction(onMoveUp)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-slate-100"
            title="Move Up"
          >
            <ArrowUp className="size-4" />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          disabled={!onDelete}
          onSelect={() => runAction(onDelete)}
          variant="destructive"
          className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-rose-50 hover:text-rose-600"
          title="Delete Card"
        >
          <Trash2 className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
