import { NextResponse } from "next/server";

import type {
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  OutlineBlock,
} from "@/lib/types/resume-outline";

function buildMockOutline(
  prompt: string,
  cardCount: number,
): GenerateOutlineResponse {
  const roleMatch = prompt.match(
    /(?:as a|for a)\s+([^.]+?)(?:\s+and|\s+with|\.|$)/i,
  );
  const role = roleMatch?.[1]?.trim() ?? "Professional";
  const title = `${role} Resume`;

  const summaryBullets = [
    `${role} with 10+ years of experience delivering accessible, high-traffic web applications.`,
    "Proven track record leading UI architecture, design system integration, and performance optimization across cross-functional teams.",
    "Expertise in WCAG 2.1 AA, semantic HTML, ARIA, and modern front-end stacks (React, Next.js, TypeScript).",
    "Skilled in architecting and implementing solutions that prioritize usability, maintainability, and measurable business impact.",
  ];

  const allBlocks: OutlineBlock[] = [
    { id: 1, title },
    { id: 2, title: "Summary", bullets: summaryBullets },
    {
      id: 3,
      title: "Experience",
      bullets: [
        "Lead frontend initiatives end-to-end",
        "Mentor engineers and establish coding standards",
      ],
    },
    {
      id: 4,
      title: "Skills",
      bullets: [
        "React, Next.js, TypeScript",
        "Accessibility, performance, testing",
      ],
    },
    { id: 5, title: "Education", bullets: ["B.S. Computer Science"] },
    { id: 6, title: "Certifications" },
    { id: 7, title: "Projects" },
    { id: 8, title: "Languages" },
    { id: 9, title: "Awards" },
    { id: 10, title: "Contact" },
  ];

  return {
    suggested_label: title,
    blocks: allBlocks.slice(0, Math.min(Math.max(cardCount, 1), 10)),
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<GenerateOutlineRequest>;
  const prompt =
    body.prompt?.trim() ||
    "Act as a Senior Frontend Developer and make an ATS friendly resume for a frontend developer.";
  const cardCount = body.card_count ?? 10;
  const format = body.format === "Letter" ? "Letter" : "A4";
  const language = body.language ?? "English (US)";

  // Simulate network latency for loading states
  await new Promise((r) => setTimeout(r, 600));

  const result = buildMockOutline(prompt, cardCount);
  return NextResponse.json({ ...result, format, language });
}
