"use client";

import { useResumeStore } from "../stores/resumeStore";
import { TEMPLATES } from "./templates/registry";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);
  
  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  return (
    <div className="w-full h-full p-4 md:p-8 bg-muted/30 overflow-y-auto print:p-0 print:bg-white print:overflow-visible flex justify-center">
      <Component />
    </div>
  );
}
