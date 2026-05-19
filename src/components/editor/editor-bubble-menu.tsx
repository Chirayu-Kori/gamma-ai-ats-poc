"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Strikethrough,
  Type,
  Underline,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUBBLE_FONT_OPTIONS, TEXT_COLORS } from "@/lib/resume-theme";
import { cn } from "@/lib/utils";

type EditorBubbleMenuProps = {
  editor: Editor | null;
  mode: "inline" | "block";
};

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
        "size-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        active && "bg-slate-200 text-slate-900",
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export function EditorBubbleMenu({ editor, mode }: EditorBubbleMenuProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { empty, from, to } = editor.state.selection;
      if (empty || !editor.isEditable) {
        setVisible(false);
        setShowColors(false);
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

    editor.on("selectionUpdate", update);
    editor.on("blur", () => {
      setVisible(false);
      setShowColors(false);
    });

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("blur", () => {
        setVisible(false);
        setShowColors(false);
      });
    };
  }, [editor]);

  if (!editor || !visible) return null;

  const currentColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? "";
  const currentFont =
    (editor.getAttributes("textStyle").fontFamily as string | undefined) ?? "";

  const menu = (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="fixed z-50 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      style={{ top: coords.top, left: coords.left }}
      onMouseDown={(e) => e.preventDefault()}
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
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-4" />
            </MenuButton>
            <MenuButton
              label="Numbered list"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
          value={currentFont || "default"}
          onValueChange={(value) => {
            if (value === "default") {
              editor.chain().focus().unsetFontFamily().run();
              return;
            }
            editor.chain().focus().setFontFamily(value).run();
          }}
        >
          <SelectTrigger
            className="h-8 w-[110px] border-0 bg-transparent px-2 text-xs shadow-none"
            aria-label="Font family"
          >
            <Type className="mr-1 size-3.5 shrink-0 text-slate-500" />
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="default">Default</SelectItem>
            {BUBBLE_FONT_OPTIONS.map((font) => (
              <SelectItem
                key={font.id}
                value={font.fontBody}
                style={{ fontFamily: font.fontBody }}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      {showColors && (
        <div className="mt-1.5 border-t border-slate-100 pt-1.5">
          <div className="flex flex-wrap items-center gap-1.5 px-0.5">
            <button
              type="button"
              title="Reset color"
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
