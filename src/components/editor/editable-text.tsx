"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Text from "@tiptap/extension-text"
import History from "@tiptap/extension-history"
import StarterKit from "@tiptap/starter-kit"

export function EditableInline({ 
  initialContent, 
  className 
}: { 
  initialContent: string, 
  className?: string 
}) {
  const InlineDocument = Document.extend({
    content: 'text*',
  })

  const editor = useEditor({
    extensions: [InlineDocument, Text, History],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `outline-none focus:outline-none transition-colors hover:ring-2 hover:ring-primary/20 rounded p-1 -m-1 whitespace-pre-wrap break-words ${className || ""}`,
      },
    },
  })
  
  return <EditorContent editor={editor} className="inline-block w-full" />
}

export function EditableBlock({ 
  initialContent, 
  className 
}: { 
  initialContent: string, 
  className?: string 
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `outline-none focus:outline-none transition-colors hover:ring-2 hover:ring-primary/20 rounded p-1.5 -mx-1.5 [&_ul]:list-square [&_ul]:list-inside [&_ul]:space-y-1 [&_p]:m-0 ${className || ""}`,
      },
    },
  })

  return <EditorContent editor={editor} />
}
