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

import { useResumeStore } from "@/stores/resumeStore";
import { SortableCard } from "./sortable-card";
import { ExperienceBlock } from "./experience-block";

export function SortableExperienceList() {
  const experience = useResumeStore((s) => s.resume?.experience);
  const reorderExperience = useResumeStore((s) => s.reorderExperience);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!experience?.length) return null;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderExperience(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      id="experience-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        id="experience-sortable"
        items={experience.map((e) => e.id!)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {experience.map((exp, index) => (
            <SortableCard
              key={exp.id}
              id={exp.id!}
              onAdd={() => useResumeStore.getState().addExperience(index)}
              onDelete={() => useResumeStore.getState().removeExperience(index)}
              onMoveUp={
                index > 0
                  ? () => reorderExperience(exp.id!, experience[index - 1].id!)
                  : undefined
              }
            >
              <ExperienceBlock index={index} />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
