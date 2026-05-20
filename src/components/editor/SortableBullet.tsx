"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  ArrowUpToLine,
  GripVertical,
  ListPlus,
  Trash2,
} from "lucide-react";

import { EditableText } from "./EditableText";
import { ListMarker } from "./list-marker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const DRAG_CLICK_THRESHOLD_PX = 8;

interface SortableBulletProps {
  id: string;
  expIdx: number;
  bulletIdx: number;
  section: "experience" | "projects";
  listStyle: "unordered" | "ordered";
  isFirst: boolean;
  onAddBelow: () => void;
  onMoveToTop: () => void;
  onDelete: () => void;
}

function BulletGripMenu({
  open,
  onOpenChange,
  isDragging,
  attributes,
  listeners,
  isFirst,
  onAddBelow,
  onMoveToTop,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDragging: boolean;
  attributes: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  isFirst: boolean;
  onAddBelow: () => void;
  onMoveToTop: () => void;
  onDelete: () => void;
}) {
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
    (action: () => void) => {
      action();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <div className="relative shrink-0">
        <DropdownMenuTrigger asChild>
          <span
            className="pointer-events-none absolute inset-0 block size-full"
            aria-hidden
          />
        </DropdownMenuTrigger>
        <button
          type="button"
          data-export-ignore
          className={cn(
            "text-muted-foreground relative z-10 mt-1 cursor-grab touch-none rounded bg-white/90 p-0.5 opacity-0 shadow-sm ring-1 ring-slate-200/80 transition-opacity group-hover:opacity-100 active:cursor-grabbing data-[state=open]:opacity-100",
            open && "opacity-100",
            isDragging && "opacity-100",
          )}
          {...attributes}
          {...(listeners ?? {})}
          onPointerDown={handleGripPointerDown}
          onClick={handleGripClick}
          aria-label="Drag bullet or open bullet actions"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <GripVertical className="size-3.5" />
        </button>
      </div>

      <DropdownMenuContent
        side="top"
        align="start"
        className="border-border w-auto min-w-0 rounded-lg bg-white/95 p-1 shadow-2xl backdrop-blur-md"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-row gap-0.5">
          <DropdownMenuItem
            onSelect={() => runAction(onAddBelow)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-blue-50 hover:text-blue-600"
            title="Add bullet below"
          >
            <ListPlus className="size-4" />
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isFirst}
            onSelect={() => runAction(onMoveToTop)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-slate-100"
            title="Move to top"
          >
            <ArrowUpToLine className="size-4" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => runAction(onDelete)}
            variant="destructive"
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all hover:bg-rose-50 hover:text-rose-600"
            title="Delete bullet"
          >
            <Trash2 className="size-4" />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SortableBullet({
  id,
  expIdx,
  bulletIdx,
  section,
  listStyle,
  isFirst,
  onAddBelow,
  onMoveToTop,
  onDelete,
}: SortableBulletProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: menuOpen });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : menuOpen ? 8 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex rounded px-2 py-0.5",
        listStyle === "ordered" ? "" : "items-start",
        isDragging ? "bg-accent/50" : "hover:bg-accent/10",
      )}
    >
      <div className="pointer-events-none absolute top-0 right-full z-20 mr-1 print:hidden">
        <div className="pointer-events-auto">
          <BulletGripMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            isDragging={isDragging}
            attributes={attributes}
            listeners={menuOpen ? undefined : listeners}
            isFirst={isFirst}
            onAddBelow={onAddBelow}
            onMoveToTop={onMoveToTop}
            onDelete={onDelete}
          />
        </div>
      </div>

      <ListMarker listStyle={listStyle} index={bulletIdx} />
      <div className="min-w-0 flex-1">
        <EditableText
          path={`${section}.${expIdx}.bullets.${bulletIdx}.text`}
          mode="inline"
          inlineWrap
          className="focus:bg-accent/10 ring-accent -ml-1 inline-block w-full rounded px-1 outline-none focus:ring-1"
          editorClassName="whitespace-normal break-words py-0 leading-relaxed"
        />
      </div>
    </li>
  );
}
