import type { Resume } from "@/lib/types/resume";

export const BACKEND_RESUME: Resume = {
  name: "Marcus Rivera",
  headline: "Senior Backend Engineer",
  contact: {
    email: "marcus.rivera@email.com",
    phone: "(555) 987-6543",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/marcusrivera",
    github: "github.com/mrivera",
    website: null,
  },
  summary:
    "Backend engineer with 8+ years designing scalable APIs, event-driven systems, and data pipelines. Strong in distributed systems, database performance, and cloud-native architecture on AWS. Delivers reliable services with observability, automated testing, and pragmatic trade-offs between speed and long-term maintainability.",
  experience: [
    {
      id: "exp-1",
      company: "Nimbus Payments",
      title: "Senior Backend Engineer",
      start: "Feb 2021",
      end: "Present",
      location: "Remote",
      bullets: [
        {
          id: "exp-1-b1",
          text: "Architected a payment orchestration service in Go handling 12M+ daily transactions with 99.95% uptime and p99 latency under 180ms.",
        },
        {
          id: "exp-1-b2",
          text: "Introduced Kafka-based event sourcing for settlement workflows, reducing reconciliation errors by 60% and enabling same-day audit trails.",
        },
        {
          id: "exp-1-b3",
          text: "Led PostgreSQL query optimization and read-replica strategy that cut average API response time by 35% during peak traffic.",
        },
        {
          id: "exp-1-b4",
          text: "Established service-level objectives, distributed tracing (OpenTelemetry), and on-call runbooks adopted across 4 platform squads.",
        },
      ],
    },
    {
      id: "exp-2",
      company: "Atlas Logistics",
      title: "Backend Engineer",
      start: "Jun 2017",
      end: "Jan 2021",
      location: "Austin, TX",
      bullets: [
        {
          id: "exp-2-b1",
          text: "Built REST and gRPC APIs in Python (FastAPI) for fleet routing and inventory, serving 500+ internal users and partner integrations.",
        },
        {
          id: "exp-2-b2",
          text: "Migrated monolithic billing module to containerized microservices on AWS ECS, improving deploy frequency from monthly to daily.",
        },
        {
          id: "exp-2-b3",
          text: "Implemented Redis caching and idempotency keys for high-volume webhook ingestion, eliminating duplicate charges in production.",
        },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Texas at Austin",
      degree: "Bachelor of Science in Computer Science",
      field: null,
      start: null,
      end: "May 2017",
      gpa: "3.7",
      highlights: [],
    },
  ],
  skills: [
    {
      category: "Languages & Runtimes",
      items: [
        "Go",
        "Python",
        "TypeScript",
        "SQL",
        "Bash",
      ],
    },
    {
      category: "Data & Messaging",
      items: [
        "PostgreSQL",
        "Redis",
        "Kafka",
        "DynamoDB",
        "Elasticsearch",
      ],
    },
    {
      category: "Cloud & DevOps",
      items: [
        "AWS",
        "Docker",
        "Kubernetes",
        "Terraform",
        "GitHub Actions",
        "Grafana",
      ],
    },
    {
      category: "Practices",
      items: [
        "System Design",
        "REST & gRPC",
        "CI/CD",
        "Observability",
        "TDD",
        "Agile",
      ],
    },
  ],
  projects: null,
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "Certified Kubernetes Application Developer (CKAD)",
  ],
};
