import type { Resume } from "@/lib/types/resume";

export const FRONTEND_RESUME: Resume = {
  name: "Sarah Chen",
  headline: "Senior Frontend Engineer",
  contact: {
    email: "sarah.chen@email.com",
    phone: "(555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahchen",
    github: "github.com/schen-dev",
    website: "sarahchen.dev",
  },
  summary:
    "Frontend engineer with 8+ years building accessible, high-performance web applications used by millions of users. Expert in React, Next.js, TypeScript, and modern CSS with deep focus on Core Web Vitals, WCAG 2.1 AA, and maintainable architecture. Partners closely with design and backend teams to ship measurable product outcomes.",
  experience: [
    {
      id: "exp-1",
      company: "Acme Technologies",
      title: "Senior Frontend Developer",
      start: "Jan 2021",
      end: "Present",
      location: "Remote",
      bullets: [
        {
          id: "exp-1-b1",
          text: "Led migration of a legacy SPA to Next.js App Router, cutting LCP by 42% and reducing bundle size by 35%.",
        },
        {
          id: "exp-1-b2",
          text: "Built an internal component library (Storybook + Radix) adopted by 6 squads; cut UI implementation time by ~30%.",
        },
        {
          id: "exp-1-b3",
          text: "Mentored 4 engineers through code reviews, pairing, and frontend guild sessions on performance and accessibility.",
        },
      ],
    },
    {
      id: "exp-2",
      company: "Brightline Digital",
      title: "Frontend Engineer",
      start: "Mar 2018",
      end: "Dec 2020",
      location: "San Francisco, CA",
      bullets: [
        {
          id: "exp-2-b1",
          text: "Owned checkout and onboarding flows serving 120k+ monthly active users; improved conversion by 18% via A/B tests.",
        },
        {
          id: "exp-2-b2",
          text: "Introduced Playwright E2E and Vitest unit tests, raising critical-path coverage from 12% to 78%.",
        },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "Bachelor of Science in Computer Science",
      field: null,
      start: null,
      end: "May 2018",
      gpa: null,
      highlights: [],
    },
  ],
  skills: [
    {
      category: "Languages & Frameworks",
      items: [
        "TypeScript",
        "JavaScript",
        "React",
        "Next.js",
        "HTML/CSS",
        "Node.js",
      ],
    },
    {
      category: "Tools & Platforms",
      items: ["Git", "Vite", "Webpack", "Docker", "AWS", "Vercel", "Figma"],
    },
    {
      category: "Practices",
      items: [
        "Accessibility (WCAG)",
        "Performance Optimization",
        "Design Systems",
        "CI/CD",
        "Unit & E2E Testing",
      ],
    },
  ],
  projects: null,
  certifications: [
    "Meta Front-End Developer Professional Certificate",
    "AWS Certified Cloud Practitioner",
  ],
};
