"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import { useEffect, useMemo } from "react";

import { EditorBubbleMenu } from "./editor-bubble-menu";
import { cn } from "@/lib/utils";

const InlineDocument = Document.extend({
  content: "text*",
});

export type RichTextFieldProps = {
  mode: "inline" | "block";
  content?: string;
  className?: string;
  placeholder?: string;
  editorClassName?: string;
  onUpdate?: (payload: { text: string; html: string }, editor: Editor) => void;
  /** When true, sync `content` prop into the editor without emitting updates */
  syncContent?: boolean;
};

function buildExtensions(mode: "inline" | "block", placeholder?: string) {
  if (mode === "inline") {
    return [InlineDocument, Text, Bold, Italic, Underline, Strike, History];
  }

  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: placeholder ?? "",
      emptyEditorClass: "is-editor-empty",
    }),
  ];
}

export function RichTextField({
  mode,
  content = "",
  className,
  editorClassName,
  placeholder,
  onUpdate,
  syncContent = true,
}: RichTextFieldProps) {
  const extensions = useMemo(
    () => buildExtensions(mode, placeholder),
    [mode, placeholder],
  );

  const baseEditorClass =
    mode === "inline"
      ? "outline-none focus:outline-none transition-colors p-1 -m-1 whitespace-nowrap break-normal [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none"
      : "outline-none focus:outline-none transition-colors break-words p-1.5 -mx-1.5 [&_ul]:!list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ul]:space-y-1 [&_ol]:!list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_ol]:space-y-1 [&_p]:m-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none";

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onUpdate?.({ text: ed.getText(), html: ed.getHTML() }, ed);
    },
    editorProps: {
      attributes: {
        class: cn(baseEditorClass, editorClassName, className),
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  useEffect(() => {
    if (!editor || !syncContent) return;

    // Avoid syncing content while the user is typing to prevent
    // state resets and unintentional transformations.
    if (editor.isFocused) return;

    const current = editor.getHTML();
    const incoming = content ?? "";

    // Normalize empty content for comparison
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    const normalizedIncoming = incoming === "<p></p>" ? "" : incoming;

    if (normalizedIncoming !== normalizedCurrent) {
      editor.commands.setContent(normalizedIncoming, { emitUpdate: false });
    }
  }, [content, editor, mode, syncContent]);

  return (
    <div
      className={cn(
        mode === "inline" ? "inline-block max-w-full" : "w-full min-w-0",
        className,
      )}
    >
      <EditorBubbleMenu editor={editor} mode={mode} />
      <EditorContent editor={editor} />
    </div>
  );
}
