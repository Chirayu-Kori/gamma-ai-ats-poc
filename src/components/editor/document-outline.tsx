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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Plus } from "lucide-react";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import {
  SECTION_TYPE_OPTIONS,
  DEFAULT_SECTION_TITLES,
} from "@/lib/resume-sections";
import type { ResumeSectionType } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function OutlineSectionRow({
  sectionId,
  title,
  visible,
  onScroll,
  onToggleVisible,
}: {
  sectionId: string;
  title: string;
  visible: boolean;
  onScroll: () => void;
  onToggleVisible: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sectionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 rounded-md px-1 py-0.5",
        !visible && "opacity-50",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground cursor-grab rounded p-1 hover:bg-slate-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${title}`}
      >
        <GripVertical className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onScroll}
        className="hover:bg-muted min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm font-medium"
      >
        <span className="truncate">{title.replace(/<[^>]+>/g, "") || "Untitled"}</span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onToggleVisible}
        aria-label={visible ? "Hide section" : "Show section"}
      >
        {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </Button>
    </div>
  );
}

export function DocumentOutline() {
  const resume = useResumeStore((s) => s.resume);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const addSection = useResumeStore((s) => s.addSection);
  const toggleSectionVisible = useResumeStore((s) => s.toggleSectionVisible);
  const triggerAutosave = useDebouncedAutosave();

  const sections = [...(resume?.sections ?? [])].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(String(active.id), String(over.id));
      triggerAutosave();
    }
  };

  const scrollToHeader = () => {
    document.getElementById("resume-header")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAddSection = (type: ResumeSectionType) => {
    addSection(type);
    triggerAutosave();
    requestAnimationFrame(() => {
      const added = useResumeStore
        .getState()
        .resume?.sections?.filter((section) => section.type === type)
        .at(-1);
      if (added) scrollToSection(added.id);
    });
  };

  if (!resume) {
    return (
      <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
        Upload a resume to begin.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      <button
        type="button"
        onClick={scrollToHeader}
        className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm font-medium"
      >
        Personal Info
      </button>

      <DndContext
        id="outline-sections-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5">
            {sections.map((section) => (
              <OutlineSectionRow
                key={section.id}
                sectionId={section.id}
                title={section.title || DEFAULT_SECTION_TITLES[section.type]}
                visible={section.visible}
                onScroll={() => scrollToSection(section.id)}
                onToggleVisible={() => {
                  toggleSectionVisible(section.id);
                  triggerAutosave();
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-full">
            <Plus className="mr-1 size-4" />
            Add section
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {SECTION_TYPE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onSelect={() => handleAddSection(option.type)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
