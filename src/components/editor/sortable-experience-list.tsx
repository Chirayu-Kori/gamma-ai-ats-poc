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
import type { Experience } from "@/lib/types/resume";
import { SortableCard } from "./sortable-card";
import { ExperienceBlock } from "./experience-block";

function ensureExperienceIds(
  items: Experience[],
): (Experience & { id: string })[] {
  return items.map((exp, i) => ({
    ...exp,
    id: exp.id ?? `exp-${i}`,
  }));
}

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

  const items = ensureExperienceIds(experience);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderExperience(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((exp, index) => (
            <SortableCard
              key={exp.id}
              id={exp.id}
              onAdd={() => useResumeStore.getState().addExperience(index)}
              onDelete={() => useResumeStore.getState().removeExperience(index)}
              onMoveUp={
                index > 0
                  ? () => reorderExperience(exp.id, items[index - 1].id)
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
