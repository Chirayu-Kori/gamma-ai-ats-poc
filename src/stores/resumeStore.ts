import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import { createId, ensureResumeIds } from "../lib/ensure-resume-ids";
import { DEFAULT_SECTION_TITLES, ensureResumeSections } from "../lib/resume-sections";
import { DEFAULT_RESUME_THEME } from "../lib/resume-theme";
import type { Resume, ResumeSectionConfig, ResumeSectionType } from "../lib/types/resume";

export type Status =
  | "idle"
  | "generating"
  | "streaming"
  | "editing"
  | "saving"
  | "error";

interface ResumeState {
  resume: Partial<Resume> | null;
  schemaVersion: number;
  status: Status;
  selectedTemplate: string;
  theme: Record<string, string>;
  focusedPath: string | null;

  setResume: (partial: Partial<Resume> | null) => void;
  setStatus: (status: Status) => void;
  updateField: (path: string, value: unknown) => void;
  reorderBullets: (expIdx: number, fromId: string, toId: string) => void;
  reorderExperience: (fromId: string, toId: string) => void;
  reorderEducation: (fromId: string, toId: string) => void;
  reorderSections: (fromId: string, toId: string) => void;
  addExperience: (index: number) => void;
  removeExperience: (index: number) => void;
  addEducation: (index: number) => void;
  removeEducation: (index: number) => void;
  addSection: (type: ResumeSectionType, afterSectionId?: string) => void;
  removeSection: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  toggleSectionVisible: (sectionId: string) => void;
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

function normalizeResume(partial: Partial<Resume>): Partial<Resume> {
  return ensureResumeSections(ensureResumeIds(partial));
}

function ensureSectionContent(
  resume: Partial<Resume>,
  type: ResumeSectionType,
) {
  switch (type) {
    case "summary":
      if (!resume.summary) resume.summary = "";
      break;
    case "experience":
      if (!resume.experience?.length) {
        resume.experience = [
          {
            id: createId("exp"),
            company: "New Company",
            title: "New Role",
            start: "Start Date",
            end: "End Date",
            location: "Location",
            bullets: [{ id: createId("bullet"), text: "Enter achievement..." }],
          },
        ];
      }
      break;
    case "education":
      if (!resume.education?.length) {
        resume.education = [
          {
            id: createId("edu"),
            institution: "New Institution",
            degree: "Degree",
            field: "Field of Study",
            start: "Start Date",
            end: "End Date",
            gpa: "",
            highlights: [],
          },
        ];
      }
      break;
    case "skills":
      if (!resume.skills?.length) {
        resume.skills = [{ category: "Skills", items: ["Skill 1"] }];
      }
      break;
    case "projects":
      if (!resume.projects?.length) {
        resume.projects = [
          {
            name: "Project Name",
            description: "Project description",
            url: null,
            tech_stack: [],
            bullets: [{ id: createId("bullet"), text: "Key outcome..." }],
          },
        ];
      }
      break;
    case "certifications":
      if (!resume.certifications?.length) {
        resume.certifications = ["Certification name"];
      }
      break;
    case "custom":
      break;
  }
}

export const useResumeStore = create<ResumeState>()(
  subscribeWithSelector(
    immer((set) => ({
      resume: null,
      schemaVersion: 2,
      status: "idle",
      selectedTemplate: "minimal",
      theme: { ...DEFAULT_RESUME_THEME },
      focusedPath: null,

      setResume: (partial) =>
        set((s) => {
          s.resume = partial ? normalizeResume(partial) : null;
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

      reorderSections: (fromId, toId) =>
        set((s) => {
          const list = s.resume?.sections;
          if (!list) return;
          const oldIndex = list.findIndex((section) => section.id === fromId);
          const newIndex = list.findIndex((section) => section.id === toId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const [item] = list.splice(oldIndex, 1);
            list.splice(newIndex, 0, item);
            list.forEach((section, index) => {
              section.order = index;
            });
          }
        }),

      addExperience: (index) =>
        set((s) => {
          if (!s.resume) return;
          if (!s.resume.experience) s.resume.experience = [];
          const newExp = {
            id: createId("exp"),
            company: "New Company",
            title: "New Role",
            start: "Start Date",
            end: "End Date",
            location: "Location",
            bullets: [{ id: createId("bullet"), text: "Enter achievement..." }],
          };
          const insertAt =
            index < 0 ? s.resume.experience.length : index + 1;
          s.resume.experience.splice(insertAt, 0, newExp);
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
            id: createId("edu"),
            institution: "New Institution",
            degree: "Degree",
            field: "Field of Study",
            start: "Start Date",
            end: "End Date",
            gpa: "",
            highlights: [],
          };
          const insertAt = index < 0 ? s.resume.education.length : index + 1;
          s.resume.education.splice(insertAt, 0, newEdu);
        }),

      removeEducation: (index) =>
        set((s) => {
          if (!s.resume?.education) return;
          s.resume.education.splice(index, 1);
        }),

      addSection: (type, afterSectionId) =>
        set((s) => {
          if (!s.resume) return;
          if (!s.resume.sections) s.resume.sections = [];

          const existing = s.resume.sections.find(
            (section) => section.type === type && type !== "custom",
          );
          if (existing) {
            existing.visible = true;
            return;
          }

          ensureSectionContent(s.resume, type);

          const newSection: ResumeSectionConfig = {
            id: createId("sec"),
            type,
            title: DEFAULT_SECTION_TITLES[type],
            visible: true,
            order: s.resume.sections.length,
            ...(type === "custom" ? { custom_content: "<p></p>" } : {}),
          };

          let insertAt = s.resume.sections.length;
          if (afterSectionId) {
            const afterIndex = s.resume.sections.findIndex(
              (section) => section.id === afterSectionId,
            );
            if (afterIndex >= 0) insertAt = afterIndex + 1;
          }

          s.resume.sections.splice(insertAt, 0, newSection);
          s.resume.sections.forEach((section, index) => {
            section.order = index;
          });
        }),

      removeSection: (sectionId) =>
        set((s) => {
          if (!s.resume?.sections) return;
          const index = s.resume.sections.findIndex(
            (section) => section.id === sectionId,
          );
          if (index === -1) return;
          s.resume.sections.splice(index, 1);
          s.resume.sections.forEach((section, idx) => {
            section.order = idx;
          });
        }),

      updateSectionTitle: (sectionId, title) =>
        set((s) => {
          const section = s.resume?.sections?.find(
            (item) => item.id === sectionId,
          );
          if (section) section.title = title;
        }),

      toggleSectionVisible: (sectionId) =>
        set((s) => {
          const section = s.resume?.sections?.find(
            (item) => item.id === sectionId,
          );
          if (section) section.visible = !section.visible;
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
