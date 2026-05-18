import { NextResponse } from "next/server";

import type { ResumeMeta } from "@/lib/types/resume-meta";
import { getResumeSeedLabel } from "@/lib/resume-seeds";

const SEED_RESUME_IDS = ["test", "frontend-dev", "backend-eng"] as const;

const MOCK_RESUMES: ResumeMeta[] = SEED_RESUME_IDS.map((id) => ({
  id,
  label: getResumeSeedLabel(id),
}));

export async function GET() {
  return NextResponse.json(MOCK_RESUMES);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { label?: string };
  const id = `resume-${Date.now()}`;
  const label = body.label?.trim() || "Untitled resume";
  const created: ResumeMeta = { id, label };
  MOCK_RESUMES.unshift(created);
  return NextResponse.json(created, { status: 201 });
}
