import { create } from "zustand";

import {
  PAGE_SIZE_PRESETS,
  type PageFormatId,
  type PageSizeUnit,
} from "@/lib/page-size";

export type PageSizePatch = {
  format?: PageFormatId;
  width?: number;
  height?: number;
  unit?: PageSizeUnit;
};

export interface GenerateState {
  format: PageFormatId;
  pageWidth: string;
  pageHeight: string;
  pageUnit: PageSizeUnit;
  language: string;

  setFormat: (format: PageFormatId) => void;
  setPageSize: (patch: PageSizePatch) => void;
  setLanguage: (lang: string) => void;
}

function applyPreset(format: Exclude<PageFormatId, "custom">) {
  const preset = PAGE_SIZE_PRESETS[format];
  return {
    format,
    pageWidth: String(preset.width),
    pageHeight: String(preset.height),
    pageUnit: preset.unit,
  };
}

export const useGenerateStore = create<GenerateState>((set) => ({
  ...applyPreset("A4"),
  language: "English (US)",

  setFormat: (format) =>
    set((state) => {
      if (format === "custom") {
        return { format: "custom" };
      }
      return { ...state, ...applyPreset(format) };
    }),

  setPageSize: (patch) =>
    set((state) => {
      const next = { ...state };
      if (patch.format !== undefined) {
        if (patch.format === "custom") {
          next.format = "custom";
        } else {
          Object.assign(next, applyPreset(patch.format));
        }
      }
      if (patch.width !== undefined) next.pageWidth = String(patch.width);
      if (patch.height !== undefined) next.pageHeight = String(patch.height);
      if (patch.unit !== undefined) next.pageUnit = patch.unit;
      if (
        patch.width !== undefined ||
        patch.height !== undefined ||
        patch.unit !== undefined
      ) {
        next.format = "custom";
      }
      return next;
    }),

  setLanguage: (language) => set({ language }),
}));
