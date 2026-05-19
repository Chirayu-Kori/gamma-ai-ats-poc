"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ResizableSidebarProps = {
  side: "left" | "right";
  width: number;
  minWidth: number;
  maxWidth: number;
  collapsed: boolean;
  onWidthChange: (width: number) => void;
  children: React.ReactNode;
  className?: string;
};

export function ResizableSidebar({
  side,
  width,
  minWidth,
  maxWidth,
  collapsed,
  onWidthChange,
  children,
  className,
}: ResizableSidebarProps) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (collapsed) return;
      dragging.current = true;
      startX.current = event.clientX;
      startWidth.current = width;
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [collapsed, width],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const delta = event.clientX - startX.current;
      const next =
        side === "left"
          ? startWidth.current + delta
          : startWidth.current - delta;
      onWidthChange(Math.min(maxWidth, Math.max(minWidth, next)));
    };

    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [maxWidth, minWidth, onWidthChange, side]);

  if (collapsed) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-background/50 relative flex h-full shrink-0 flex-col overflow-hidden border-slate-200 backdrop-blur-sm",
        side === "left" ? "border-r" : "border-l",
        className,
      )}
      style={{ width }}
    >
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${side} sidebar`}
        onPointerDown={onPointerDown}
        className={cn(
          "absolute top-0 z-10 h-full w-1.5 touch-none transition-colors hover:bg-blue-400/40",
          side === "left" ? "right-0 cursor-col-resize" : "left-0 cursor-col-resize",
        )}
      />
    </div>
  );
}
