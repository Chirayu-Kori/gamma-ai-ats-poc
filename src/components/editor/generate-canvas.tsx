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
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextField } from "@/components/editor/rich-text-field";
import { SortableCard } from "@/components/editor/sortable-card";
import { useGenerateOutline } from "@/hooks/useGenerateOutline";
import { useGenerateStore } from "@/stores/generateStore";
import { buildMockOutlineResponse } from "@/lib/mock-outline-data";
import {
  blockToHtml,
  htmlToBlock,
  toEditableBlocks,
  type EditableOutlineBlock,
} from "@/lib/outline-utils";
import { cn } from "@/lib/utils";

const DEFAULT_PROMPT =
  "Act as a Senior Frontend Developer and make an ATS friendly resume for a frontend developer.";

function SortableOutlineBlockCard({
  block,
  selected,
  onSelect,
  onBlockChange,
  onAdd,
  onDelete,
  onMoveUp,
}: {
  block: EditableOutlineBlock;
  selected?: boolean;
  onSelect?: () => void;
  onBlockChange: (
    patch: Pick<EditableOutlineBlock, "title" | "bullets" | "paragraph">,
  ) => void;
  onAdd?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
}) {
  return (
    <SortableCard
      id={block.sortId}
      className="items-start"
      selected={selected}
      onSelect={onSelect}
      onAdd={onAdd}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
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
  const {
    prompt,
    cardCount,
    format,
    language,
    blocks,
    selectedBlockId,
    setBlocks,
    setSelectedBlockId,
  } = useGenerateStore();

  const setPrompt = useGenerateStore((s) => s.setPrompt);

  const generateOutline = useGenerateOutline();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const applyOutlineBlocks = useCallback(
    (rawBlocks: Parameters<typeof toEditableBlocks>[0]) => {
      const next = toEditableBlocks(rawBlocks);
      setBlocks(next);
      setSelectedBlockId(next[0]?.sortId ?? null);
    },
    [setBlocks, setSelectedBlockId],
  );

  const runGenerate = useCallback(() => {
    generateOutline.mutate(
      { prompt, cardCount, format, language },
      {
        onSuccess: (data) => applyOutlineBlocks(data.blocks),
        onError: () => {
          const fallback = buildMockOutlineResponse(prompt, cardCount);
          applyOutlineBlocks(fallback.blocks);
        },
      },
    );
  }, [
    generateOutline,
    prompt,
    cardCount,
    format,
    language,
    applyOutlineBlocks,
  ]);

  useEffect(() => {
    if (blocks.length === 0) {
      runGenerate();
    }
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

  const reindexBlocks = (items: EditableOutlineBlock[]) =>
    items.map((b, i) => ({ ...b, id: i + 1 }));

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
      return reindexBlocks(next);
    });
  };

  const removeBlock = (sortId: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.sortId !== sortId);
      return reindexBlocks(next);
    });
    setSelectedBlockId((current) =>
      current === sortId ? null : current,
    );
  };

  const moveBlockUp = (index: number) => {
    if (index <= 0) return;
    setBlocks((prev) => reindexBlocks(arrayMove(prev, index, index - 1)));
  };

  const isGenerating = generateOutline.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <h1 className="text-center text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl">
        Generate Outline
      </h1>

      <div className="mt-8 space-y-4">
        {/* We keep the text area for quick prompt editing but move the main settings to the right panel */}
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

      {(blocks.length > 0 || isGenerating) && (
        <div className="mt-10 space-y-3">
          <h2 className="text-sm font-medium text-slate-500">Proposed Structure</h2>
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
                    <div key={block.sortId} id={block.sortId}>
                      <div className="py-1">
                        <SortableOutlineBlockCard
                          block={block}
                          selected={selectedBlockId === block.sortId}
                          onSelect={() => setSelectedBlockId(block.sortId)}
                          onBlockChange={(patch) =>
                            updateBlock(block.sortId, patch)
                          }
                          onAdd={() => addBlock(index + 1)}
                          onDelete={() => removeBlock(block.sortId)}
                          onMoveUp={
                            index > 0
                              ? () => moveBlockUp(index)
                              : undefined
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
      )}

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
