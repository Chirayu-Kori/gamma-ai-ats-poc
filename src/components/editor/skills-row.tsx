"use client";

import { X } from "lucide-react";

import { useResumeStore } from "@/stores/resumeStore";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { EditableText } from "./EditableText";
import { RichTextField } from "./rich-text-field";

function parseSkillItems(text: string): string[] {
  return text
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const EMPTY_ITEMS: readonly string[] = Object.freeze([]) as readonly string[];

export type SkillsRowVariant = "row" | "stacked" | "pills";

export function SkillsRow({
  index,
  variant = "row",
}: {
  index: number;
  variant?: SkillsRowVariant;
}) {
  // Selecting `items` directly returns the same reference across renders when
  // the store didn't change; the previous `?? []` minted a fresh `[]` every
  // call and caused a render loop. Fall back to a frozen module-level array.
  const items = useResumeStore(
    (s) =>
      (s.resume?.skills?.[index]?.items as string[] | undefined) ?? EMPTY_ITEMS,
  );
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const joined = items.filter(Boolean).join(", ");
  const stacked = variant === "stacked";
  const pills = variant === "pills";

  const updateItem = (itemIndex: number, text: string) => {
    const next = [...items];
    next[itemIndex] = text;
    updateField(`skills.${index}.items`, next);
    triggerAutosave();
  };

  const addItem = () => {
    updateField(`skills.${index}.items`, [...items, ""]);
    triggerAutosave();
  };

  const removeItem = (itemIndex: number) => {
    const next = items.filter((_, i) => i !== itemIndex);
    updateField(`skills.${index}.items`, next);
    triggerAutosave();
  };

  if (pills) {
    // Show filled pills plus a trailing empty slot when adding a new skill.
    const indicesToRender =
      items.length === 0
        ? []
        : items
            .map((_, i) => i)
            .filter((i) => Boolean(items[i]?.trim()) || i === items.length - 1);

    return (
      <div className="flex min-w-0 flex-col gap-2">
        <EditableText
          path={`skills.${index}.category`}
          mode="inline"
          inlineWrap
          className="creative-skills-category w-full text-[10px] font-bold tracking-widest uppercase"
          placeholder="Category"
        />
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {indicesToRender.map((itemIndex) => (
            <span
              key={itemIndex}
              className="creative-skill-pill-wrap group/pill relative inline-flex shrink-0"
            >
              <span className="creative-skill-pill inline-flex min-h-6 items-center whitespace-nowrap">
                <RichTextField
                  mode="inline"
                  content={items[itemIndex] ?? ""}
                  className="creative-skill-pill-editor min-w-11 shrink-0 text-xs leading-tight"
                  editorClassName="min-w-11 py-0 text-xs leading-tight whitespace-nowrap"
                  placeholder="Skill"
                  onUpdate={({ text }) => updateItem(itemIndex, text)}
                />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(itemIndex);
                }}
                className="creative-skill-pill-remove"
                aria-label={`Remove ${items[itemIndex]?.trim() || "skill"}`}
              >
                <X className="size-3" strokeWidth={2.5} aria-hidden />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addItem();
            }}
            className="creative-skill-pill creative-skill-pill-add inline-flex items-center px-2 py-0.5 text-xs font-medium"
            aria-label="Add skill"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        stacked
          ? "flex min-w-0 flex-col gap-1"
          : "flex min-w-0 items-start gap-4"
      }
    >
      <EditableText
        path={`skills.${index}.category`}
        mode="inline"
        inlineWrap
        className={
          stacked
            ? "w-full pt-0 text-sm font-semibold capitalize"
            : "w-36 shrink-0 pt-0.5 text-sm font-semibold capitalize"
        }
      />
      <div
        className={
          stacked
            ? "min-w-0 w-full text-sm leading-relaxed opacity-85"
            : "text-muted-foreground min-w-0 flex-1 text-sm leading-relaxed"
        }
      >
        <RichTextField
          mode="inline"
          content={joined}
          className="min-w-0"
          editorClassName="min-w-0"
          placeholder="Skill 1, Skill 2, Skill 3"
          onUpdate={({ text }) => {
            updateField(`skills.${index}.items`, parseSkillItems(text));
            triggerAutosave();
          }}
        />
      </div>
    </div>
  );
}
