"use client";

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

export function SkillsRow({ index }: { index: number }) {
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

  return (
    <div className="flex min-w-0 items-start gap-4">
      <EditableText
        path={`skills.${index}.category`}
        mode="inline"
        className="w-36 shrink-0 pt-0.5 text-sm font-semibold capitalize"
      />
      <div className="text-muted-foreground min-w-0 flex-1 text-sm leading-relaxed">
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
