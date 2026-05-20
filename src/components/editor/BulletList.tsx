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
import { ListPlus } from "lucide-react";

import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { useResumeStore } from "../../stores/resumeStore";
import { Button } from "@/components/ui/button";

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
  const addBullet = useResumeStore((s) => s.addBullet);
  const removeBullet = useResumeStore((s) => s.removeBullet);
  const moveBulletToTop = useResumeStore((s) => s.moveBulletToTop);
  const triggerAutosave = useDebouncedAutosave();

  const parent =
    section === "experience"
      ? resume?.experience?.[expIdx]
      : resume?.projects?.[expIdx];
  const listStyle =
    parent?.bulletsStyle === "ordered" ? "ordered" : "unordered";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const runAndSave = (action: () => void) => {
    action();
    triggerAutosave();
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (section === "experience") {
        reorderExperienceBullets(expIdx, String(active.id), String(over.id));
      } else {
        reorderProjectBullets(expIdx, String(active.id), String(over.id));
      }
      triggerAutosave();
    }
  };

  if (!bullets || bullets.length === 0) {
    return (
      <div className="mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-slate-600"
          onClick={() =>
            runAndSave(() => addBullet(section, expIdx, -1))
          }
        >
          <ListPlus className="size-3.5" />
          Add bullet
        </Button>
      </div>
    );
  }

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
        <ul className="mt-2 list-none space-y-1 overflow-visible text-sm">
          {bullets.map((b, i) => (
            <SortableBullet
              key={b.id}
              id={b.id!}
              expIdx={expIdx}
              bulletIdx={i}
              section={section}
              listStyle={listStyle}
              isFirst={i === 0}
              onAddBelow={() =>
                runAndSave(() => addBullet(section, expIdx, i))
              }
              onMoveToTop={() =>
                runAndSave(() => moveBulletToTop(section, expIdx, b.id!))
              }
              onDelete={() => runAndSave(() => removeBullet(section, expIdx, i))}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
