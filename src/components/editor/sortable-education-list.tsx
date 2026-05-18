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
import type { Education } from "@/lib/types/resume";
import { SortableCard } from "./sortable-card";
import { EducationBlock } from "./education-block";

function ensureEducationIds(
  items: Education[],
): (Education & { id: string })[] {
  return items.map((edu, i) => ({
    ...edu,
    id: edu.id ?? `edu-${i}`,
  }));
}

export function SortableEducationList() {
  const education = useResumeStore((s) => s.resume?.education);
  const reorderEducation = useResumeStore((s) => s.reorderEducation);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!education?.length) return null;

  const items = ensureEducationIds(education);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderEducation(String(active.id), String(over.id));
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
        <div className="space-y-4">
          {items.map((edu, index) => (
            <SortableCard
              key={edu.id}
              id={edu.id}
              onAdd={() => useResumeStore.getState().addEducation(index)}
              onDelete={() => useResumeStore.getState().removeEducation(index)}
              onMoveUp={
                index > 0
                  ? () => reorderEducation(edu.id, items[index - 1].id)
                  : undefined
              }
            >
              <EducationBlock index={index} />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
