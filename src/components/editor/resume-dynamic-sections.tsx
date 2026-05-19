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

import { getVisibleSections } from "@/lib/resume-sections";
import type { ResumeSectionType } from "@/lib/types/resume";
import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { SortableCard } from "./sortable-card";
import { EditableSectionTitle } from "./editable-section-title";
import { ResumeSectionContent } from "./resume-section-content";
import { cn } from "@/lib/utils";

export type SectionTitleVariant =
  | "default"
  | "executive"
  | "modern"
  | "compact"
  | "creative"
  | "atlantic"
  | "classic"
  | "bold"
  | "stripe";

const TITLE_CLASSES: Record<SectionTitleVariant, string> = {
  default:
    "mb-3 pb-1 font-semibold tracking-wider uppercase text-[color:var(--color-accent)]",
  executive:
    "resume-heading mb-3 text-xs font-bold tracking-[0.2em] uppercase text-[color:var(--color-accent)] border-b-2 border-[color:var(--color-accent)] pb-1",
  modern:
    "mb-2 text-sm font-bold tracking-wider uppercase text-[color:var(--color-accent)]",
  compact: "compact-label mb-2",
  creative: "creative-section-title mb-2",
  atlantic: "atlantic-main-heading mb-2",
  classic: "classic-section-title mb-3 text-center text-sm font-bold tracking-[0.3em] uppercase",
  bold: "mb-3 text-xs font-black tracking-[0.25em] uppercase text-[color:var(--color-accent)] border-l-4 border-[color:var(--color-accent)] pl-3",
  stripe: "stripe-section-title mb-3",
};

type ResumeDynamicSectionsProps = {
  titleVariant?: SectionTitleVariant;
  excludeTypes?: ResumeSectionType[];
  className?: string;
  sectionClassName?: string;
  editable?: boolean;
};

export function ResumeDynamicSections({
  titleVariant = "default",
  excludeTypes = [],
  className,
  sectionClassName,
  editable = true,
}: ResumeDynamicSectionsProps) {
  const resume = useResumeStore((s) => s.resume);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const removeSection = useResumeStore((s) => s.removeSection);
  const addSection = useResumeStore((s) => s.addSection);
  const triggerAutosave = useDebouncedAutosave();

  const sections = getVisibleSections(resume).filter(
    (section) => !excludeTypes.includes(section.type),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!sections.length) {
    if (!editable) return null;
    return (
      <div className={cn("rounded-lg border border-dashed p-6 text-center", className)}>
        <p className="text-muted-foreground mb-3 text-sm">
          No sections yet. Add one from the outline panel or here.
        </p>
        <button
          type="button"
          className="text-primary text-sm font-medium hover:underline"
          onClick={() => {
            addSection("summary");
            triggerAutosave();
          }}
        >
          Add Summary section
        </button>
      </div>
    );
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(String(active.id), String(over.id));
      triggerAutosave();
    }
  };

  const titleClass = TITLE_CLASSES[titleVariant];

  const renderSection = (section: (typeof sections)[number], index: number) => (
    <section
      id={`section-${section.id}`}
      data-section-type={section.type}
      className={cn("mb-6 min-w-0 scroll-mt-24", sectionClassName)}
    >
      <EditableSectionTitle
        sectionId={section.id}
        className={titleClass}
      />
      <ResumeSectionContent section={section} />
    </section>
  );

  if (!editable) {
    return (
      <div className={cn("min-w-0 space-y-2", className)}>
        {sections.map((section) => (
          <div key={section.id}>{renderSection(section, 0)}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      id="resume-sections-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        id="resume-sections-sortable"
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("min-w-0 space-y-2", className)}>
          {sections.map((section, index) => (
            <SortableCard
              key={section.id}
              id={section.id}
              onAdd={() => {
                addSection("custom", section.id);
                triggerAutosave();
              }}
              onDelete={() => {
                removeSection(section.id);
                triggerAutosave();
              }}
              onMoveUp={
                index > 0
                  ? () => {
                      reorderSections(section.id, sections[index - 1].id);
                      triggerAutosave();
                    }
                  : undefined
              }
            >
              {renderSection(section, index)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
