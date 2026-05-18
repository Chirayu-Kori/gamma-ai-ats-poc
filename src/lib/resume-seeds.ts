import type { Resume } from "@/lib/types/resume";
import { DEFAULT_RESUME } from "@/lib/default-resume";
import { FRONTEND_RESUME } from "@/lib/frontend-resume";
import { BACKEND_RESUME } from "@/lib/backend-resume";

export const RESUME_SEED_LABELS: Record<string, string> = {
  test: "Demo Resume",
  "frontend-dev": "Frontend Developer",
  "backend-eng": "Backend Engineer",
};

const RESUME_SEEDS: Record<string, Resume> = {
  test: DEFAULT_RESUME,
  "frontend-dev": FRONTEND_RESUME,
  "backend-eng": BACKEND_RESUME,
};

export function getResumeSeedLabel(id: string): string {
  return RESUME_SEED_LABELS[id] ?? `Resume ${id}`;
}

export function getResumeSeed(id: string): Resume | null {
  return RESUME_SEEDS[id] ?? null;
}
