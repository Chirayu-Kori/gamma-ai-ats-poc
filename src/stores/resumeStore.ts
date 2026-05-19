import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { DEFAULT_RESUME_THEME } from "../lib/resume-theme";
import { Resume } from "../lib/types/resume";

export type Status =
  | "idle"
  | "generating"
  | "streaming"
  | "editing"
  | "saving"
  | "error";

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
  setResume: (partial: Partial<Resume> | null) => void;
  setStatus: (status: Status) => void;
  updateField: (path: string, value: unknown) => void;
  reorderBullets: (expIdx: number, fromId: string, toId: string) => void;
  reorderExperience: (fromId: string, toId: string) => void;
  reorderEducation: (fromId: string, toId: string) => void;
  addExperience: (index: number) => void;
  removeExperience: (index: number) => void;
  addEducation: (index: number) => void;
  removeEducation: (index: number) => void;
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
      theme: { ...DEFAULT_RESUME_THEME },
      focusedPath: null,

      setResume: (partial) =>
        set((s) => {
          s.resume = partial;
        }),
      setStatus: (status) =>
        set((s) => {
          s.status = status;
        }),

      updateField: (path, value) =>
        set((s) => {
          setByPath(s.resume, path, value);
        }),

      reorderBullets: (expIdx, fromId, toId) =>
        set((s) => {
          if (!s.resume?.experience?.[expIdx]?.bullets) return;
          const bullets = s.resume.experience[expIdx].bullets;
          const oldIndex = bullets.findIndex(
            (b: { id?: string }) => b.id === fromId,
          );
          const newIndex = bullets.findIndex(
            (b: { id?: string }) => b.id === toId,
          );
          if (oldIndex !== -1 && newIndex !== -1) {
            const [item] = bullets.splice(oldIndex, 1);
            bullets.splice(newIndex, 0, item);
          }
        }),

      reorderExperience: (fromId, toId) =>
        set((s) => {
          const list = s.resume?.experience;
          if (!list) return;
          const oldIndex = list.findIndex((e) => e.id === fromId);
          const newIndex = list.findIndex((e) => e.id === toId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const [item] = list.splice(oldIndex, 1);
            list.splice(newIndex, 0, item);
          }
        }),

      reorderEducation: (fromId, toId) =>
        set((s) => {
          const list = s.resume?.education;
          if (!list) return;
          const oldIndex = list.findIndex((e) => e.id === fromId);
          const newIndex = list.findIndex((e) => e.id === toId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const [item] = list.splice(oldIndex, 1);
            list.splice(newIndex, 0, item);
          }
        }),

      addExperience: (index) =>
        set((s) => {
          if (!s.resume) return;
          if (!s.resume.experience) s.resume.experience = [];
          const newExp = {
            id: `exp-${Date.now()}`,
            company: "New Company",
            title: "New Role",
            start: "Start Date",
            end: "End Date",
            location: "Location",
            bullets: [{ text: "Enter achievement..." }],
          };
          s.resume.experience.splice(index + 1, 0, newExp);
        }),

      removeExperience: (index) =>
        set((s) => {
          if (!s.resume?.experience) return;
          s.resume.experience.splice(index, 1);
        }),

      addEducation: (index) =>
        set((s) => {
          if (!s.resume) return;
          if (!s.resume.education) s.resume.education = [];
          const newEdu = {
            id: `edu-${Date.now()}`,
            institution: "New Institution",
            degree: "Degree",
            field: "Field of Study",
            start: "Start Date",
            end: "End Date",
            gpa: "",
            highlights: [],
          };
          s.resume.education.splice(index + 1, 0, newEdu);
        }),

      removeEducation: (index) =>
        set((s) => {
          if (!s.resume?.education) return;
          s.resume.education.splice(index, 1);
        }),

      setTemplate: (id) =>
        set((s) => {
          s.selectedTemplate = id;
        }),
      setTheme: (patch) =>
        set((s) => {
          Object.assign(s.theme, patch);
        }),
      setFocusedPath: (path) =>
        set((s) => {
          s.focusedPath = path;
        }),
    })),
  ),
);
