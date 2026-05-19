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
import { EducationBlock } from "./education-block";
import { useScaleAwareDnd } from "@/hooks/use-scale-aware-dnd";

export function SortableEducationList() {
  const education = useResumeStore((s) => s.resume?.education);
  const reorderEducation = useResumeStore((s) => s.reorderEducation);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const { modifiers } = useScaleAwareDnd();

  if (!education?.length) return null;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderEducation(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext
      id="education-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={modifiers}
    >
      <SortableContext
        id="education-sortable"
        items={education.map((e) => e.id!)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {education.map((edu, index) => (
            <SortableCard
              key={edu.id}
              id={edu.id!}
              onAdd={() => useResumeStore.getState().addEducation(index)}
              onDelete={() => useResumeStore.getState().removeEducation(index)}
              onMoveUp={
                index > 0
                  ? () => reorderEducation(edu.id!, education[index - 1].id!)
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
