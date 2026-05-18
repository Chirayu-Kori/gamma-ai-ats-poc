import { NextResponse } from "next/server";

import type { ResumeMeta } from "@/lib/types/resume-meta";
import { getResumeSeedLabel } from "@/lib/resume-seeds";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body: ResumeMeta = {
    id,
    label: getResumeSeedLabel(id),
  };
  return NextResponse.json(body);
}
