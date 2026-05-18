import { create } from "zustand";

export interface GenerateState {
  format: "A4" | "Letter";
  language: string;

  setFormat: (format: "A4" | "Letter") => void;
  setLanguage: (lang: string) => void;
}

export const useGenerateStore = create<GenerateState>((set) => ({
  format: "A4",
  language: "English (US)",

  setFormat: (format) => set({ format }),
  setLanguage: (language) => set({ language }),
}));
