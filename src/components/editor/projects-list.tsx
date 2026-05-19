"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { createId } from "@/lib/ensure-resume-ids";
import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function ProjectsList() {
  const projects = useResumeStore((s) => s.resume?.projects) ?? [];
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const addProject = () => {
    updateField("projects", [
      ...projects,
      {
        name: "Project Name",
        description: "Project description",
        url: null,
        tech_stack: [],
        bullets: [{ id: createId("bullet"), text: "Key outcome..." }],
      },
    ]);
    triggerAutosave();
  };

  const removeProject = (index: number) => {
    updateField(
      "projects",
      projects.filter((_, i) => i !== index),
    );
    triggerAutosave();
  };

  if (!projects.length) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={addProject}>
        <Plus className="mr-1 size-4" />
        Add project
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((_, index) => (
        <article key={index} className="group rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200">
          <div className="mb-1 flex items-start justify-between gap-2">
            <EditableText
              path={`projects.${index}.name`}
              mode="inline"
              className="font-semibold"
              placeholder="Project name"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeProject(index)}
              aria-label="Remove project"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <EditableText
            path={`projects.${index}.description`}
            mode="block"
            className="text-muted-foreground mb-2 text-sm"
            placeholder="Short project description"
          />
          <BulletList expIdx={index} section="projects" />
        </article>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addProject}>
        <Plus className="mr-1 size-4" />
        Add project
      </Button>
    </div>
  );
}
