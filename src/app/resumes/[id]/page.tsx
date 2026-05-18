import { EditorLayout } from "@/components/editor/editor-layout";

type ResumeEditorPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ResumeEditorPageProps) {
  const { id } = await params;
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
