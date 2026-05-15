"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useResumeStore } from "../../stores/resumeStore";
import { SortableBullet } from "./SortableBullet";

interface BulletListProps {
  expIdx: number;
  section?: "experience" | "projects";
}

export function BulletList({ expIdx, section = "experience" }: BulletListProps) {
  const resume = useResumeStore((s) => s.resume);
  const bullets = section === "experience" 
    ? resume?.experience?.[expIdx]?.bullets 
    : resume?.projects?.[expIdx]?.bullets;
    
  const reorder = useResumeStore((s) => s.reorderBullets);

  // Fallback if no bullets
  if (!bullets || bullets.length === 0) return null;

  // Add random IDs if missing (they should be added on creation/parsing in a real app)
  const itemsWithIds = bullets.map((b: { id?: string }, i: number) => ({
    ...b,
    id: b.id || `bullet-${expIdx}-${i}`
  }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (section === "experience") {
        reorder(expIdx, active.id as string, over.id as string);
      }
      // Reordering for projects can be added similarly
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext 
        items={itemsWithIds.map((b: { id?: string }) => b.id as string)} 
        strategy={verticalListSortingStrategy}
      >
        <ul className="list-disc ml-4 space-y-1 mt-2 text-sm">
          {itemsWithIds.map((b: { id?: string }, i: number) => (
            <SortableBullet 
              key={b.id as string} 
              id={b.id as string} 
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
