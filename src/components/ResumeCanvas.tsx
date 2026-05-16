"use client";

import { useResumeStore } from "../stores/resumeStore";
import { TEMPLATES } from "./templates/registry";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);

  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  return (
    <div className="bg-muted/30 custom-scrollbar flex h-full w-full justify-center overflow-y-auto p-4 md:p-8 print:overflow-visible print:bg-white print:p-0">
      <Component />
    </div>
  );
}
