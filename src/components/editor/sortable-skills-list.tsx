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
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { SortableCard } from "./sortable-card";
import { SkillsRow } from "./skills-row";

export function SortableSkillsList() {
  const skills = useResumeStore((s) => s.resume?.skills);
  const reorderSkills = useResumeStore((s) => s.reorderSkills);
  const triggerAutosave = useDebouncedAutosave();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!skills?.length) return null;

  const skillIds = skills.map((group, index) => group.id ?? `skill-${index}`);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSkills(String(active.id), String(over.id));
      triggerAutosave();
    }
  };

  return (
    <DndContext
      id="skills-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        id="skills-sortable"
        items={skillIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {skills.map((group, index) => {
            const id = group.id ?? skillIds[index];
            return (
              <SortableCard
                key={id}
                id={id}
                onAdd={() => {
                  useResumeStore.getState().addSkillGroup(index);
                  triggerAutosave();
                }}
                onDelete={() => {
                  useResumeStore.getState().removeSkillGroup(index);
                  triggerAutosave();
                }}
                onMoveUp={
                  index > 0
                    ? () => {
                        reorderSkills(id, skills[index - 1].id!);
                        triggerAutosave();
                      }
                    : undefined
                }
              >
                <SkillsRow index={index} />
              </SortableCard>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
