import { create } from "zustand";
import { EditableOutlineBlock } from "@/lib/outline-utils";

export interface GenerateState {
  prompt: string;
  cardCount: number;
  format: "A4" | "Letter";
  language: string;
  blocks: EditableOutlineBlock[];
  selectedBlockId: string | null;

  setPrompt: (prompt: string) => void;
  setCardCount: (count: number) => void;
  setFormat: (format: "A4" | "Letter") => void;
  setLanguage: (lang: string) => void;
  setBlocks: (
    blocks:
      | EditableOutlineBlock[]
      | ((prev: EditableOutlineBlock[]) => EditableOutlineBlock[]),
  ) => void;
  setSelectedBlockId: (
    id: string | null | ((prev: string | null) => string | null),
  ) => void;
}

const DEFAULT_PROMPT =
  "Act as a Senior Frontend Developer and make an ATS friendly resume for a frontend developer.";

export const useGenerateStore = create<GenerateState>((set) => ({
  prompt: DEFAULT_PROMPT,
  cardCount: 10,
  format: "A4",
  language: "English (US)",
  blocks: [],
  selectedBlockId: null,

  setPrompt: (prompt) => set({ prompt }),
  setCardCount: (cardCount) => set({ cardCount }),
  setFormat: (format) => set({ format }),
  setLanguage: (language) => set({ language }),
  setBlocks: (blocksOrFn) =>
    set((state) => ({
      blocks:
        typeof blocksOrFn === "function"
          ? blocksOrFn(state.blocks)
          : blocksOrFn,
    })),
  setSelectedBlockId: (idOrFn) =>
    set((state) => ({
      selectedBlockId:
        typeof idOrFn === "function" ? idOrFn(state.selectedBlockId) : idOrFn,
    })),
}));
