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

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(".ProseMirror") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[data-section-ai]"),
  );
}

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

const TITLE_BASE = "resume-section-title max-w-full";

const TITLE_CLASSES: Record<SectionTitleVariant, string> = {
  default: cn(
    TITLE_BASE,
    "mb-3 pb-1 text-sm font-semibold tracking-[0.12em] uppercase text-[color:var(--color-accent)]",
  ),
  executive: cn(
    TITLE_BASE,
    "resume-heading mb-3 text-xs font-bold tracking-[0.12em] uppercase text-[color:var(--color-accent)] border-b-2 border-[color:var(--color-accent)] pb-1",
  ),
  modern: cn(
    TITLE_BASE,
    "mb-2 text-sm font-bold tracking-widest uppercase text-[color:var(--color-accent)]",
  ),
  compact: cn(TITLE_BASE, "compact-label mb-2"),
  creative: cn(TITLE_BASE, "creative-section-title mb-2"),
  atlantic: cn(TITLE_BASE, "atlantic-main-heading mb-2"),
  classic: cn(
    TITLE_BASE,
    "classic-section-title mb-3 text-center text-sm font-bold tracking-[0.15em] uppercase",
  ),
  bold: cn(
    TITLE_BASE,
    "mb-3 text-xs font-black tracking-[0.12em] uppercase text-[color:var(--color-accent)] border-l-4 border-[color:var(--color-accent)] pl-3",
  ),
  stripe: cn(TITLE_BASE, "stripe-section-title mb-3"),
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
  const selectedSectionId = useResumeStore((s) => s.selectedSectionId);
  const setSelectedSectionId = useResumeStore((s) => s.setSelectedSectionId);
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
            const added = useResumeStore
              .getState()
              .resume?.sections?.filter((s) => s.type === "summary")
              .at(-1);
            if (added) setSelectedSectionId(added.id);
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

  const renderSection = (section: (typeof sections)[number], index: number) => {
    const isSelected = selectedSectionId === section.id;
    return (
      <section
        id={`section-${section.id}`}
        data-section-type={section.type}
        data-section-id={section.id}
        className={cn(
          "mb-6 min-w-0 scroll-mt-24 rounded-lg transition-shadow",
          sectionClassName,
          isSelected && "ring-2 ring-violet-400/80 ring-offset-2 ring-offset-white",
        )}
        onClick={(e) => {
          if (isEditableTarget(e.target)) return;
          setSelectedSectionId(isSelected ? null : section.id);
        }}
      >
        <EditableSectionTitle sectionId={section.id} className={titleClass} />
        <ResumeSectionContent section={section} />
      </section>
    );
  };

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
              section={section}
              selected={selectedSectionId === section.id}
              onSectionAiOpen={() => setSelectedSectionId(section.id)}
              onAdd={() => {
                addSection("custom", section.id);
                const added = useResumeStore.getState().resume?.sections?.at(-1);
                if (added) setSelectedSectionId(added.id);
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
