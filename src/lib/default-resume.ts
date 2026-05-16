import type { Resume } from "@/lib/types/resume";

export const DEFAULT_RESUME: Resume = {
  name: "Jane Doe",
  headline: "Product Engineer & UI/UX Designer",
  contact: {
    email: "hello@janedoe.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    linkedin: null,
    github: null,
    website: null,
  },
  summary:
    "Product-focused engineer with experience shipping accessible, high-performance web applications.",
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
          text: "Led the migration of a legacy monolithic application to a modern micro-frontend architecture using Next.js and React, improving page load speeds by 45%.",
        },
        {
          id: "exp-1-b2",
          text: "Mentored a team of 4 junior developers and established CI/CD pipelines that reduced deployment times from hours to minutes.",
        },
        {
          id: "exp-1-b3",
          text: "Designed and implemented a comprehensive UI component library utilizing Tailwind CSS, increasing cross-team development velocity by 30%.",
        },
      ],
    },
    {
      id: "exp-2",
      company: "Stark Industries",
      title: "Software Engineer",
      start: "Mar 2018",
      end: "Dec 2020",
      location: "New York, NY",
      bullets: [
        {
          id: "exp-2-b1",
          text: "Developed critical features for the internal analytics dashboard using Vue.js and D3.js.",
        },
        {
          id: "exp-2-b2",
          text: "Optimized database query performance, resulting in a 20% reduction in average API response time.",
        },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      field: "Computer Science",
      start: null,
      end: "May 2018",
      gpa: null,
      highlights: [],
    },
  ],
  skills: [
    {
      category: "Technical",
      items: ["React", "Next.js", "TypeScript", "Node.js"],
    },
  ],
  projects: null,
  certifications: null,
};
