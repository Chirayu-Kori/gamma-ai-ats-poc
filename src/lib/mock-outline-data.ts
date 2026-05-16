import type { OutlineBlock } from "@/lib/types/resume-outline";

function parseRoleFromPrompt(prompt: string): string {
  const roleMatch = prompt.match(
    /(?:as a|for a)\s+([^.]+?)(?:\s+and|\s+with|\.|$)/i,
  );
  return roleMatch?.[1]?.trim() ?? "Senior Frontend Developer";
}

export function buildMockOutlineBlocks(
  prompt: string,
  cardCount: number,
): OutlineBlock[] {
  const role = parseRoleFromPrompt(prompt);
  const title = `${role} Resume`;

  const allBlocks: OutlineBlock[] = [
    { id: 1, title },
    {
      id: 2,
      title: "Professional Summary",
      paragraph: `${role} with 8+ years building accessible, high-performance web applications used by millions of users. Expert in React, Next.js, TypeScript, and modern CSS — with deep focus on Core Web Vitals, WCAG 2.1 AA, and maintainable architecture. Collaborative engineer who partners with product, design, and backend teams to deliver measurable business outcomes.`,
    },
    {
      id: 3,
      title: "Experience — Acme Technologies",
      bullets: [
        "Led migration of legacy SPA to Next.js App Router, cutting LCP by 42% and reducing bundle size by 35%.",
        "Built an internal component library (Storybook + Radix) adopted by 6 product squads; cut UI implementation time by ~30%.",
        "Mentored 4 engineers through code reviews, pairing, and frontend guild sessions on performance and accessibility.",
        "Partnered with design to implement token-based theming and dark mode across the customer dashboard.",
      ],
    },
    {
      id: 4,
      title: "Experience — Brightline Digital",
      bullets: [
        "Owned checkout and onboarding flows serving 120k+ monthly active users; improved conversion by 18% via A/B tests.",
        "Introduced Playwright E2E and Vitest unit tests, raising critical-path coverage from 12% to 78%.",
        "Integrated REST and GraphQL APIs with optimistic UI patterns and robust error boundaries.",
      ],
    },
    {
      id: 5,
      title: "Technical Skills",
      bullets: [
        "Languages: TypeScript, JavaScript (ES2022), HTML5, CSS3",
        "Frameworks: React 19, Next.js 16, TanStack Query, Zustand",
        "Tooling: Vite, Webpack, ESLint, Prettier, GitHub Actions, Docker",
        "Practices: Accessibility (ARIA), performance profiling, design systems, Agile/Scrum",
      ],
    },
    {
      id: 6,
      title: "Education",
      bullets: [
        "B.S. Computer Science — State University, 2016",
        "Relevant coursework: Algorithms, Human-Computer Interaction, Web Systems",
        "Dean's List (4 semesters)",
      ],
    },
    {
      id: 7,
      title: "Certifications",
      paragraph: "Meta Front-End Developer Professional Certificate, AWS Certified Cloud Practitioner, ICAgile Certified Professional (ICP)",
    },
    {
      id: 8,
      title: "Projects",
      bullets: [
        "OpenResume — ATS-friendly resume builder (Next.js, TipTap, PDF export) with 2k+ GitHub stars",
        "Focus UI — Accessible React component kit with automated a11y regression tests",
        "PerfLens — Chrome extension for Lighthouse audits and bundle diff reports",
      ],
    },
    {
      id: 9,
      title: "Languages",
      bullets: [
        "English — Native",
        "Spanish — Professional working proficiency",
        "Hindi — Conversational",
      ],
    },
    {
      id: 10,
      title: "Awards & Recognition",
      bullets: [
        "Engineering Impact Award — Q3 2024 (Acme Technologies)",
        "Speaker, regional React meetup: “Shipping faster with design tokens”",
        "Hackathon winner — internal accessibility tooling challenge, 2023",
      ],
    },
  ];

  const count = Math.min(Math.max(cardCount, 1), allBlocks.length);
  return allBlocks.slice(0, count).map((block, index) => ({
    ...block,
    id: index + 1,
  }));
}

export function buildMockOutlineResponse(prompt: string, cardCount: number) {
  const blocks = buildMockOutlineBlocks(prompt, cardCount);
  const role = parseRoleFromPrompt(prompt);
  return {
    suggested_label: `${role} Resume`,
    blocks,
  };
}
