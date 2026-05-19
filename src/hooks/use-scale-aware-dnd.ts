"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Modifier } from "@dnd-kit/core";

const TRANSFORM_CONTENT_SELECTOR = ".react-transform-component";

/** Read uniform scale from react-zoom-pan-pinch content element. */
function readCanvasScale(): number {
  if (typeof document === "undefined") return 1;
  const el = document.querySelector(TRANSFORM_CONTENT_SELECTOR);
  if (!el) return 1;

  const style = window.getComputedStyle(el);
  const matrix = style.transform;
  if (!matrix || matrix === "none") return 1;

  // matrix(a, b, c, d, tx, ty) or matrix3d(...)
  const match2d = matrix.match(/^matrix\(([^)]+)\)$/);
  if (match2d) {
    const a = parseFloat(match2d[1].split(",")[0]?.trim() ?? "1");
    return Number.isFinite(a) && a > 0 ? a : 1;
  }

  const match3d = matrix.match(/^matrix3d\(([^)]+)\)$/);
  if (match3d) {
    const parts = match3d[1].split(",").map((s) => parseFloat(s.trim()));
    const a = parts[0];
    return Number.isFinite(a) && a > 0 ? a : 1;
  }

  return 1;
}

/**
 * Compensates @dnd-kit drag deltas when the resume canvas is scaled
 * (react-zoom-pan-pinch). Without this, reorder handles feel offset/sluggish.
 */
export function useScaleAwareDnd() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(readCanvasScale());
    update();

    const el = document.querySelector(TRANSFORM_CONTENT_SELECTOR);
    if (!el) return;

    const observer = new MutationObserver(update);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const scaleModifier: Modifier = useCallback(
    ({ transform }) => {
      if (scale === 1) return transform;
      return {
        ...transform,
        x: transform.x / scale,
        y: transform.y / scale,
      };
    },
    [scale],
  );

  const modifiers = useMemo(
    () => (scale === 1 ? undefined : [scaleModifier]),
    [scale, scaleModifier],
  );

  return { modifiers, scale };
}
