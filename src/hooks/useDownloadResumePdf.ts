"use client";

import { useCallback, useState } from "react";

import {
  buildResumePdfFilename,
  downloadResumePdf,
} from "@/lib/export-resume-pdf";
import { useResumeStore } from "@/stores/resumeStore";

export function useDownloadResumePdf() {
  const [exporting, setExporting] = useState(false);
  const theme = useResumeStore((s) => s.theme);
  const resume = useResumeStore((s) => s.resume);
  const templateId = useResumeStore((s) => s.selectedTemplate);
  const resumeName = resume?.name;

  const downloadPdf = useCallback(async () => {
    if (!resume) {
      console.warn("No resume data to export");
      return;
    }

    setExporting(true);
    try {
      await downloadResumePdf(resume, {
        theme,
        templateId,
        filename: buildResumePdfFilename(resumeName),
      });
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setExporting(false);
    }
  }, [theme, templateId, resume, resumeName]);

  return { downloadPdf, exporting };
}
