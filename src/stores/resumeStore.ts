import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { Resume } from "../lib/types/resume";

export type Status = "idle" | "streaming" | "editing" | "saving" | "error";

interface ResumeState {
  // Data
  resume: Partial<Resume> | null;
  schemaVersion: number;

  // UI state
  status: Status;
  selectedTemplate: string;
  theme: Record<string, string>;
  focusedPath: string | null;

  // Actions
  setResume: (partial: Partial<Resume>) => void;
  setStatus: (status: Status) => void;
  updateField: (path: string, value: unknown) => void;
  reorderBullets: (expIdx: number, fromId: string, toId: string) => void;
  setTemplate: (id: string) => void;
  setTheme: (patch: Record<string, string>) => void;
  setFocusedPath: (path: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setByPath(obj: any, path: string, value: unknown) {
  if (!obj) return;
  const keys = path.split(".");
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = isNaN(Number(k)) ? k : Number(k);
    if (node[next] === undefined) {
      node[next] = isNaN(Number(keys[i + 1])) ? {} : [];
    }
    node = node[next];
  }
  node[keys[keys.length - 1]] = value;
}

export const useResumeStore = create<ResumeState>()(
  subscribeWithSelector(
    immer((set) => ({
      resume: null,
      schemaVersion: 1,

      status: "idle",
      selectedTemplate: "minimal",
      theme: {},
      focusedPath: null,

      setResume: (partial) => set((s) => { s.resume = partial; }),
      setStatus: (status) => set((s) => { s.status = status; }),
      
      updateField: (path, value) => set((s) => {
        setByPath(s.resume, path, value);
      }),

      reorderBullets: (expIdx, fromId, toId) => set((s) => {
        if (!s.resume?.experience?.[expIdx]?.bullets) return;
        const bullets = s.resume.experience[expIdx].bullets;
        const oldIndex = bullets.findIndex((b: { id?: string }) => b.id === fromId);
        const newIndex = bullets.findIndex((b: { id?: string }) => b.id === toId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const [item] = bullets.splice(oldIndex, 1);
          bullets.splice(newIndex, 0, item);
        }
      }),

      setTemplate: (id) => set((s) => { s.selectedTemplate = id; }),
      setTheme: (patch) => set((s) => { Object.assign(s.theme, patch); }),
      setFocusedPath: (path) => set((s) => { s.focusedPath = path; }),
    }))
  )
);
