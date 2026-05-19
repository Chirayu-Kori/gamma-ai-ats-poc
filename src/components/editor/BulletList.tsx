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
import { useResumeStore } from "../../stores/resumeStore";
import { SortableBullet } from "./SortableBullet";

interface BulletListProps {
  expIdx: number;
  section?: "experience" | "projects";
}

export function BulletList({
  expIdx,
  section = "experience",
}: BulletListProps) {
  const resume = useResumeStore((s) => s.resume);
  const bullets =
    section === "experience"
      ? resume?.experience?.[expIdx]?.bullets
      : resume?.projects?.[expIdx]?.bullets;

  const reorderExperienceBullets = useResumeStore((s) => s.reorderBullets);
  const reorderProjectBullets = useResumeStore((s) => s.reorderProjectBullets);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!bullets || bullets.length === 0) return null;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (section === "experience") {
        reorderExperienceBullets(expIdx, String(active.id), String(over.id));
      } else {
        reorderProjectBullets(expIdx, String(active.id), String(over.id));
      }
    }
  };

  return (
    <DndContext
      id={`bullets-dnd-${section}-${expIdx}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        id={`bullets-sortable-${section}-${expIdx}`}
        items={bullets.map((b) => b.id!)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="mt-2 list-none space-y-1 text-sm">
          {bullets.map((b, i) => (
            <SortableBullet
              key={b.id}
              id={b.id!}
              expIdx={expIdx}
              bulletIdx={i}
              section={section}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
