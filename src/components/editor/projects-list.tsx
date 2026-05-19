"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createId, ensureResumeIds } from "@/lib/ensure-resume-ids";
import { useEffect, useRef } from "react";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { useResumeStore } from "@/stores/resumeStore";
import { ProjectBlock } from "./project-block";
import { SortableCard } from "./sortable-card";

export function ProjectsList() {
  const projects = useResumeStore((s) => s.resume?.projects) ?? [];
  const updateField = useResumeStore((s) => s.updateField);
  const reorderProjects = useResumeStore((s) => s.reorderProjects);
  const triggerAutosave = useDebouncedAutosave();
  const idsEnsured = useRef(false);

  useEffect(() => {
    if (idsEnsured.current || !projects.some((p) => !p.id)) return;
    idsEnsured.current = true;
    const fixed = ensureResumeIds({ projects }).projects;
    if (fixed) updateField("projects", fixed);
  }, [projects, updateField]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addProject = () => {
    updateField("projects", [
      ...projects,
      {
        id: createId("proj"),
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

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderProjects(String(active.id), String(over.id));
      triggerAutosave();
    }
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
    <div className="space-y-2">
      <DndContext
        id="projects-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          id="projects-sortable"
          items={projects.map((p) => p.id!)}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((proj, index) => (
            <SortableCard
              key={proj.id}
              id={proj.id!}
              onAdd={() => {
                const list = useResumeStore.getState().resume?.projects ?? [];
                updateField("projects", [
                  ...list.slice(0, index + 1),
                  {
                    id: createId("proj"),
                    name: "Project Name",
                    description: "Project description",
                    url: null,
                    tech_stack: [],
                    bullets: [{ id: createId("bullet"), text: "Key outcome..." }],
                  },
                  ...list.slice(index + 1),
                ]);
                triggerAutosave();
              }}
              onDelete={() => removeProject(index)}
              onMoveUp={
                index > 0
                  ? () => {
                      reorderProjects(proj.id!, projects[index - 1].id!);
                      triggerAutosave();
                    }
                  : undefined
              }
            >
              <ProjectBlock index={index} />
            </SortableCard>
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="ghost" size="sm" onClick={addProject}>
        <Plus className="mr-1 size-4" />
        Add project
      </Button>
    </div>
  );
}
