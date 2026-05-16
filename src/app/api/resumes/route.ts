import { NextResponse } from "next/server";

import type { ResumeMeta } from "@/lib/types/resume-meta";

const MOCK_RESUMES: ResumeMeta[] = [
  { id: "test", label: "Demo Resume" },
  { id: "frontend-dev", label: "Frontend Developer" },
  { id: "backend-eng", label: "Backend Engineer" },
];

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
