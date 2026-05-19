"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { EditableText } from "./EditableText";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function CertificationsList() {
  const certifications = useResumeStore((s) => s.resume?.certifications) ?? [];
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const addCert = () => {
    updateField("certifications", [...certifications, "New certification"]);
    triggerAutosave();
  };

  const removeCert = (index: number) => {
    updateField(
      "certifications",
      certifications.filter((_, i) => i !== index),
    );
    triggerAutosave();
  };

  if (!certifications.length) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={addCert}>
        <Plus className="mr-1 size-4" />
        Add certification
      </Button>
    );
  }

  return (
    <ul className="space-y-2">
      {certifications.map((_, index) => (
        <li key={index} className="group flex items-start gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
          <EditableText
            path={`certifications.${index}`}
            mode="inline"
            inlineWrap
            className="min-w-0 flex-1 text-sm"
            placeholder="Certification name"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => removeCert(index)}
            aria-label="Remove certification"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </li>
      ))}
      <li>
        <Button type="button" variant="ghost" size="sm" onClick={addCert}>
          <Plus className="mr-1 size-4" />
          Add certification
        </Button>
      </li>
    </ul>
  );
}
