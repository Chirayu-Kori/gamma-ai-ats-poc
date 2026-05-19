import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { ResumePdfDocument } from "@/pdf/ResumePdfDocument";
import { buildResumePdfFilename } from "@/lib/export-resume-pdf";
import type { Resume } from "@/lib/types/resume";

export const runtime = "nodejs";

type ExportPdfBody = {
  resume: Partial<Resume>;
  theme: Record<string, string>;
  templateId?: string;
  filename?: string;
};

export async function POST(request: Request) {
  let body: ExportPdfBody;
  try {
    body = (await request.json()) as ExportPdfBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.resume) {
    return NextResponse.json({ error: "Missing resume data" }, { status: 400 });
  }

  const filename = body.filename ?? buildResumePdfFilename(body.resume.name);
  const theme = body.theme ?? {};
  const templateId = body.templateId ?? "minimal";

  try {
    const buffer = await renderToBuffer(
      ResumePdfDocument({ resume: body.resume, theme, templateId }),
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation failed", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
