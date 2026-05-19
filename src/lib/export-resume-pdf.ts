import type { Resume } from "@/lib/types/resume";

export function buildResumePdfFilename(name: string | undefined): string {
  const base = (name || "resume")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base || "resume"}.pdf`;
}

export async function downloadResumePdf(
  resume: Partial<Resume>,
  options: {
    filename: string;
    theme: Record<string, string>;
    templateId: string;
  },
): Promise<void> {
  const response = await fetch("/api/export-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume,
      theme: options.theme,
      templateId: options.templateId,
      filename: options.filename,
    }),
  });

  if (!response.ok) {
    const message =
      (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(message?.error ?? `PDF export failed (${response.status})`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = options.filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
