"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Sparkles,
  Strikethrough,
  Type,
  Underline,
  Undo2,
} from "lucide-react";

import { SelectionAIPopover } from "./selection-ai-popover";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { BUBBLE_FONT_OPTIONS, TEXT_COLORS } from "@/lib/resume-theme";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resumeStore";

type EditorBubbleMenuProps = {
  editor: Editor | null;
  mode: "inline" | "block";
  fieldPath?: string;
  onFieldApply?: (html: string) => void;
};

function getBulletsStylePath(fieldPath?: string): string | null {
  if (!fieldPath) return null;
  const bulletMatch = fieldPath.match(
    /^(experience|projects)\.(\d+)\.bullets\.\d+\.text$/,
  );
  if (bulletMatch) return `${bulletMatch[1]}.${bulletMatch[2]}.bulletsStyle`;

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split(".").reduce((acc: any, part) => {
    if (acc === undefined) return undefined;
    return acc[isNaN(Number(part)) ? part : Number(part)];
  }, obj);
}

function MenuButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "size-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        active && "bg-slate-200 text-slate-900",
      )}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function EditorBubbleMenu({
  editor,
  mode,
  fieldPath,
  onFieldApply,
}: EditorBubbleMenuProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [showColors, setShowColors] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const showAIRef = useRef(false);
  const selectOpenRef = useRef(false);
  showAIRef.current = showAI;

  const resume = useResumeStore((s) => s.resume);
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();
  const bulletsStylePath = getBulletsStylePath(fieldPath);
  const resumeListStyle =
    getByPath(resume, bulletsStylePath ?? "") === "ordered"
      ? "ordered"
      : "unordered";

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { empty, from, to } = editor.state.selection;
      if (empty || !editor.isEditable) {
        setVisible(false);
        setShowColors(false);
        setShowAI(false);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      setCoords({
        top: Math.min(start.top, end.top) - 56,
        left: (start.left + end.left) / 2,
      });
      setVisible(true);
    };

    const onBlur = () => {
      window.setTimeout(() => {
        if (!showAIRef.current && !selectOpenRef.current) {
          setVisible(false);
          setShowColors(false);
          setShowAI(false);
        }
      }, 0);
    };

    editor.on("selectionUpdate", update);
    editor.on("blur", onBlur);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("blur", onBlur);
    };
  }, [editor]);

  if (!editor || !visible) return null;

  const canUseAI = Boolean(fieldPath && onFieldApply);

  const toggleBulletList = () => {
    if (editor.isActive("orderedList")) {
      editor.chain().focus().toggleOrderedList().toggleBulletList().run();
      return;
    }
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    if (editor.isActive("bulletList")) {
      editor.chain().focus().toggleBulletList().toggleOrderedList().run();
      return;
    }
    editor.chain().focus().toggleOrderedList().run();
  };

  const setResumeListStyle = (style: "unordered" | "ordered") => {
    if (!bulletsStylePath) return;
    updateField(bulletsStylePath, style);
    triggerAutosave();
    editor.chain().focus().run();
  };

  const currentColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? "";
  const currentFont =
    (editor.getAttributes("textStyle").fontFamily as string | undefined) ?? "";
  const currentFontId =
    BUBBLE_FONT_OPTIONS.find((font) => font.fontBody === currentFont)?.id ??
    "default";

  const menu = (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="fixed z-50 flex w-max min-w-0 -translate-x-1/2 flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="flex items-center gap-0.5">
        <MenuButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </MenuButton>
        <MenuButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </MenuButton>
        <MenuButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </MenuButton>
        <MenuButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </MenuButton>

        {mode === "block" && (
          <>
            <div className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
            <MenuButton
              label="Bullet list"
              active={editor.isActive("bulletList")}
              onClick={toggleBulletList}
            >
              <List className="size-4" />
            </MenuButton>
            <MenuButton
              label="Numbered list"
              active={editor.isActive("orderedList")}
              onClick={toggleOrderedList}
            >
              <ListOrdered className="size-4" />
            </MenuButton>
          </>
        )}

        {bulletsStylePath && (
          <>
            <div className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
            <MenuButton
              label="Bullet list"
              active={resumeListStyle === "unordered"}
              onClick={() => setResumeListStyle("unordered")}
            >
              <List className="size-4" />
            </MenuButton>
            <MenuButton
              label="Numbered list"
              active={resumeListStyle === "ordered"}
              onClick={() => setResumeListStyle("ordered")}
            >
              <ListOrdered className="size-4" />
            </MenuButton>
          </>
        )}

        <div className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />

        <MenuButton
          label="Text color"
          active={showColors || Boolean(currentColor)}
          onClick={() => setShowColors((v) => !v)}
        >
          <Palette className="size-4" />
        </MenuButton>

        <Select
          value={currentFontId}
          onOpenChange={(open) => {
            selectOpenRef.current = open;
            if (!open) {
              editor.chain().focus().run();
            }
          }}
          onValueChange={(value) => {
            if (value === "default") {
              editor.chain().focus().unsetFontFamily().run();
              return;
            }
            const font = BUBBLE_FONT_OPTIONS.find((option) => option.id === value);
            if (font) {
              editor.chain().focus().setFontFamily(font.fontBody).run();
            }
          }}
        >
          <SelectTrigger
            className="h-8 w-[110px] border-0 bg-transparent px-2 text-xs shadow-none"
            aria-label="Font family"
            onMouseDown={() => {
              selectOpenRef.current = true;
            }}
          >
            <Type className="mr-1 size-3.5 shrink-0 text-slate-500" />
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent align="center" className="z-100">
            <SelectItem value="default">Default</SelectItem>
            {BUBBLE_FONT_OPTIONS.map((font) => (
              <SelectItem
                key={font.id}
                value={font.id}
                style={{ fontFamily: font.fontBody }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canUseAI && (
          <>
            <div className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
            <MenuButton
              label="Rewrite with AI"
              active={showAI}
              onClick={() => {
                setShowAI((v) => !v);
                setShowColors(false);
              }}
            >
              <Sparkles className="size-4 text-violet-600" />
            </MenuButton>
          </>
        )}

        <div className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />
        <MenuButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </MenuButton>
        <MenuButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </MenuButton>
      </div>

      {showAI && canUseAI && fieldPath && onFieldApply && (
        <SelectionAIPopover
          editor={editor}
          fieldPath={fieldPath}
          onApplied={onFieldApply}
          onClose={() => setShowAI(false)}
        />
      )}

      {showColors && (
        <div className="mt-1.5 w-full border-t border-slate-100 pt-1.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-0.5">
            <button
              type="button"
              title="Reset color"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().unsetColor().run()}
              className={cn(
                "flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500",
                !currentColor && "ring-primary ring-2 ring-offset-1",
              )}
            >
              A
            </button>
            {TEXT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setColor(color.value).run()
                }
                className={cn(
                  "size-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110",
                  currentColor === color.value &&
                    "ring-primary ring-2 ring-offset-1",
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
            <label
              className="relative flex size-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-300 bg-slate-50"
              title="Custom color"
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className="text-[10px] text-slate-500">+</span>
              <input
                type="color"
                className="absolute inset-0 cursor-pointer opacity-0"
                value={currentColor || "#1e293b"}
                onChange={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(menu, document.body);
}
