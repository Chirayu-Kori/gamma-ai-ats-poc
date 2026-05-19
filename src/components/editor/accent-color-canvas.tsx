"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pipette } from "lucide-react";

import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(input: string): string {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`;
  }
  return "#2563eb";
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

type AccentColorCanvasProps = {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

export function AccentColorCanvas({
  value,
  onChange,
  className,
}: AccentColorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const initial = hexToHsl(value);
  const [hue, setHue] = useState(initial.h);
  const [saturation, setSaturation] = useState(initial.s);
  const [lightness, setLightness] = useState(initial.l);
  const [hexInput, setHexInput] = useState(normalizeHex(value));

  useEffect(() => {
    const hsl = hexToHsl(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    setHexInput(normalizeHex(value));
  }, [value]);

  const emit = useCallback(
    (h: number, s: number, l: number) => {
      const hex = hslToHex(h, s, l);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const pickFromCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      const s = x * 100;
      const l = 100 - y * 100;
      setSaturation(s);
      setLightness(l);
      emit(hue, s, l);
    },
    [emit, hue],
  );

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    pickFromCanvas(event.clientX, event.clientY);
  };

  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    pickFromCanvas(event.clientX, event.clientY);
  };

  const onCanvasPointerUp = () => {
    dragging.current = false;
  };

  const markerLeft = `${saturation}%`;
  const markerTop = `${100 - lightness}%`;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50/80 p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
        <Pipette className="size-3.5 text-slate-400" />
        Custom accent
      </div>

      <div
        ref={canvasRef}
        role="application"
        aria-label="Color canvas"
        className="relative h-36 w-full cursor-crosshair overflow-hidden rounded-lg shadow-inner"
        style={{ backgroundColor: `hsl(${hue} 100% 50%)` }}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerLeave={onCanvasPointerUp}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black to-transparent" />
        <div
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/20"
          style={{
            left: markerLeft,
            top: markerTop,
            backgroundColor: hslToHex(hue, saturation, lightness),
          }}
        />
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          Hue
        </span>
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(hue)}
          onChange={(e) => {
            const h = Number(e.target.value);
            setHue(h);
            emit(h, saturation, lightness);
          }}
          className="accent-primary h-2 w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), 
              hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))`,
          }}
        />
      </label>

      <div className="mt-3 flex items-center gap-2">
        <div
          className="size-10 shrink-0 rounded-lg border border-slate-200 shadow-sm"
          style={{ backgroundColor: hexInput }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={() => {
            const hex = normalizeHex(hexInput);
            const hsl = hexToHsl(hex);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
            setHexInput(hex);
            onChange(hex);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const hex = normalizeHex(hexInput);
              const hsl = hexToHsl(hex);
              setHue(hsl.h);
              setSaturation(hsl.s);
              setLightness(hsl.l);
              setHexInput(hex);
              onChange(hex);
            }
          }}
          className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          aria-label="Hex color"
        />
        <input
          type="color"
          value={normalizeHex(hexInput)}
          onChange={(e) => {
            const hex = normalizeHex(e.target.value);
            const hsl = hexToHsl(hex);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
            setHexInput(hex);
            onChange(hex);
          }}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
          aria-label="Native color picker"
        />
      </div>
    </div>
  );
}
