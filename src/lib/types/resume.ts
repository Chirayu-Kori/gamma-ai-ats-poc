export interface ContactInfo {
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
}

export interface Bullet {
  text: string;
  impact_score?: number | null;
  keywords?: string[];
  id?: string; // Client-side ID for dnd-kit
}

export interface Experience {
  id?: string;
  company: string;
  title: string;
  start: string;
  end: string | null;
  location: string | null;
  bullets: Bullet[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string | null;
  start: string | null;
  end: string | null;
  gpa: string | null;
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  url: string | null;
  tech_stack: string[];
  bullets: Bullet[];
}

export interface Resume {
  name: string;
  headline: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  projects?: Project[] | null;
  certifications?: string[] | null;
}
