import { NextResponse } from "next/server";

import { buildMockOutlineResponse } from "@/lib/mock-outline-data";
import type { GenerateOutlineRequest } from "@/lib/types/resume-outline";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<GenerateOutlineRequest>;
  const prompt =
    body.prompt?.trim() ||
    "Act as a Senior Frontend Developer and make an ATS friendly resume for a frontend developer.";
  const cardCount = body.card_count ?? 10;
  const format = body.format === "Letter" ? "Letter" : "A4";
  const language = body.language ?? "English (US)";

  await new Promise((r) => setTimeout(r, 600));

  const result = buildMockOutlineResponse(prompt, cardCount);
  return NextResponse.json({ ...result, format, language });
}
