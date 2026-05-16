import { NextResponse } from "next/server";

import type { ResumeMeta } from "@/lib/types/resume-meta";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body: ResumeMeta = {
    id,
    label: id === "test" ? "Demo resume" : `Resume ${id}`,
  };
  return NextResponse.json(body);
}
