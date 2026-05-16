"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { empty, from, to } = editor.state.selection;
      if (empty || !editor.isEditable) {
        setVisible(false);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      setCoords({
        top: Math.min(start.top, end.top) - 48,
        left: (start.left + end.left) / 2,
      });
      setVisible(true);
    };

    editor.on("selectionUpdate", update);
    editor.on("blur", () => setVisible(false));

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("blur", () => setVisible(false));
    };
  }, [editor]);

  if (!editor || !visible) return null;

  const menu = (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
      style={{ top: coords.top, left: coords.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
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
  );

  return createPortal(menu, document.body);
}
