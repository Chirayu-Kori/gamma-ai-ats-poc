import { headers } from "next/headers";

import { EditorLayout } from "@/components/editor/editor-layout";
import type { ResumeMeta } from "@/lib/types/resume-meta";

type ResumeEditorPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ResumeEditorPageProps) {
  const { id } = await params;

  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const res = await fetch(`${protocol}://${host}/api/resumes/${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const meta = (await res.json()) as ResumeMeta;
      return {
        title: `Editor | ${meta.label}`,
        description: "Edit and upgrade your ATS-friendly resume",
      };
    }
  } catch {
    // fall through to default title
  }

  return {
    title: `Editor | Resume ${id}`,
    description: "Edit and upgrade your ATS-friendly resume",
  };
}

export default async function ResumeEditorPage({
  params,
}: ResumeEditorPageProps) {
  const { id } = await params;

  return <EditorLayout resumeId={id} />;
}
