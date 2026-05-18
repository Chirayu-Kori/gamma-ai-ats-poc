"use client";

import { useResumeStore } from "../stores/resumeStore";
import { TEMPLATES } from "./templates/registry";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);

  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  return (
    <div className="bg-muted/30 flex w-full min-w-0 justify-center p-4 md:p-8 print:bg-white print:p-0">
      <Component />
    </div>
  );
}
