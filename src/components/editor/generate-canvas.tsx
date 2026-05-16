"use client";

import { useCallback, useEffect, useState } from "react";
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
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FileText, Languages, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextField } from "@/components/editor/rich-text-field";
import { SortableCard } from "@/components/editor/sortable-card";
import { useGenerateOutline } from "@/hooks/useGenerateOutline";
import {
  blockToHtml,
  htmlToBlock,
  toEditableBlocks,
  type EditableOutlineBlock,
} from "@/lib/outline-utils";
import { cn } from "@/lib/utils";

const DEFAULT_PROMPT =
  "Act as a Senior Frontend Developer and make an ATS friendly resume for a frontend developer.";

const CARD_OPTIONS = [5, 8, 10] as const;
const FORMAT_OPTIONS = ["A4", "Letter"] as const;
const LANGUAGE_OPTIONS = [
  "English (US)",
  "English (UK)",
  "Spanish",
  "French",
] as const;

function PillSelect<T extends string | number>({
  value,
  options,
  onChange,
  formatLabel,
  className,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
  className?: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        className={cn(
          "h-9 w-full rounded-full border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm",
          "focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-200",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={String(opt)} value={String(opt)}>
            {formatLabel ? formatLabel(opt) : String(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SelectField({
  icon: Icon,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-400" />
      )}
      {children}
    </div>
  );
}

function SortableOutlineBlockCard({
  block,
  selected,
  onSelect,
  onBlockChange,
}: {
  block: EditableOutlineBlock;
  selected?: boolean;
  onSelect?: () => void;
  onBlockChange: (
    patch: Pick<EditableOutlineBlock, "title" | "bullets">,
  ) => void;
}) {
  return (
    <SortableCard
      id={block.sortId}
      className="items-start"
      selected={selected}
      onSelect={onSelect}
    >
      <div className="flex min-w-0 overflow-hidden rounded-lg border border-slate-200/80">
        <div
          aria-hidden
          className="flex w-10 shrink-0 justify-center bg-blue-50 p-4 text-sm font-bold text-blue-800"
        >
          {block.id}
        </div>
        <div className="min-w-0 flex-1 bg-white px-4 py-3">
          <RichTextField
            mode="block"
            content={blockToHtml(block)}
            syncContent
            placeholder="Section title…"
            className="text-sm text-slate-700 [&>p:first-child]:font-semibold [&>p:first-child]:text-slate-800"
            onUpdate={({ html }) => onBlockChange(htmlToBlock(html))}
          />
        </div>
      </div>
    </SortableCard>
  );
}

function AddCardZone({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="group relative -my-2 flex h-4 items-center justify-center transition-all">
      {/* Visual line */}
      <div className="h-0.5 w-full rounded-full bg-blue-400/30 opacity-0 transition-all group-hover:opacity-100" />

      {/* Plus button */}
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="absolute z-10 size-7 scale-75 rounded-full border-blue-200 bg-white opacity-0 shadow-xl transition-all group-hover:opacity-100 hover:scale-100 hover:bg-blue-600 hover:text-white"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

type GenerateCanvasProps = {
  onComplete: () => void;
};

export function GenerateCanvas({ onComplete }: GenerateCanvasProps) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [cardCount, setCardCount] = useState<number>(10);
  const [format, setFormat] = useState<"A4" | "Letter">("A4");
  const [language, setLanguage] = useState<string>("English (US)");
  const [blocks, setBlocks] = useState<EditableOutlineBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const generateOutline = useGenerateOutline();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const runGenerate = useCallback(() => {
    generateOutline.mutate(
      { prompt, cardCount, format, language },
      {
        onSuccess: (data) => {
          const next = toEditableBlocks(data.blocks);
          setBlocks(next);
          setSelectedBlockId(next[0]?.sortId ?? null);
        },
      },
    );
  }, [generateOutline, prompt, cardCount, format, language]);

  useEffect(() => {
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((items) => {
      const oldIndex = items.findIndex((b) => b.sortId === active.id);
      const newIndex = items.findIndex((b) => b.sortId === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const updateBlock = (
    sortId: string,
    patch: Partial<EditableOutlineBlock>,
  ) => {
    setBlocks((prev) =>
      prev.map((b) => (b.sortId === sortId ? { ...b, ...patch } : b)),
    );
  };

  const addBlock = (index: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const newBlock: EditableOutlineBlock = {
        id: next.length + 1,
        sortId: `custom-${Date.now()}`,
        title: "New Section",
        bullets: ["New detail..."],
      };
      next.splice(index, 0, newBlock);

      // Optional: re-index IDs to keep them sequential
      return next.map((b, i) => ({ ...b, id: i + 1 }));
    });
  };

  const isGenerating = generateOutline.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <h1 className="text-center text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl">
        Generate
      </h1>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-slate-500">Prompt</span>
          <SelectField className="min-w-30">
            <PillSelect
              value={cardCount}
              options={CARD_OPTIONS}
              onChange={(v) => setCardCount(Number(v))}
              formatLabel={(v) => `${v} cards`}
            />
          </SelectField>
          <SelectField icon={FileText} className="min-w-28">
            <PillSelect
              value={format}
              options={FORMAT_OPTIONS}
              onChange={setFormat}
              className="pl-9"
            />
          </SelectField>
          <SelectField icon={Languages} className="min-w-36">
            <PillSelect
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={setLanguage}
              className="pl-9"
            />
          </SelectField>
        </div>

        <div className="relative rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full resize-none border-0 bg-transparent pr-14 text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Describe the resume you want to generate..."
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-3 bottom-3 size-10 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700"
            onClick={runGenerate}
            disabled={isGenerating}
            aria-label="Regenerate outline"
          >
            <RefreshCw
              className={cn("size-4", isGenerating && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-medium text-slate-500">Outline</h2>
        <div className="rounded-xl border border-slate-200/60 bg-white/60 px-5 py-3">
          {isGenerating && blocks.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-lg" />
                  <Skeleton className="h-20 flex-1 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.sortId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1 py-1">
                  {blocks.map((block, index) => (
                    <div key={block.sortId}>
                      <div className="py-1">
                        <SortableOutlineBlockCard
                          block={block}
                          selected={selectedBlockId === block.sortId}
                          onSelect={() => setSelectedBlockId(block.sortId)}
                          onBlockChange={(patch) =>
                            updateBlock(block.sortId, patch)
                          }
                        />
                      </div>

                      <AddCardZone onAdd={() => addBlock(index + 1)} />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {blocks.length > 0 && !isGenerating && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="rounded-full bg-[#1e3a5f] px-8 hover:bg-[#162d4a]"
            onClick={onComplete}
          >
            Continue to resume
          </Button>
        </div>
      )}
    </div>
  );
}
