"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useResumeStore } from "../../stores/resumeStore";
import { useDebouncedAutosave } from "../../hooks/useDebouncedAutosave";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split(".").reduce((acc: any, part) => {
    if (acc === undefined) return undefined;
    return acc[isNaN(Number(part)) ? part : Number(part)];
  }, obj);
}

interface EditableTextProps {
  path: string;
  as?: React.ElementType;
  className?: string;
  placeholder?: string;
}

export function EditableText({ path, className, placeholder }: EditableTextProps) {
  const resume = useResumeStore((s) => s.resume);
  const value = getByPath(resume, path);
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false, bulletList: false })],
    content: value || "",
    onUpdate: ({ editor }) => {
      // For simple inline text, we only want plain text. 
      // If rich text is needed, use getHTML() instead.
      const updatedText = editor.getText();
      updateField(path, updatedText);
      triggerAutosave();
    },
    editorProps: {
      attributes: {
        class: typeof className === "string" ? className : "",
        placeholder: placeholder || "Click to format text",
      },
    },
  });

  // Sync external changes (streaming, template swap) back into the editor
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getText()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  return <EditorContent editor={editor} />;
}
