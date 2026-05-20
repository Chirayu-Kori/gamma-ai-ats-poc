"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

export function ProjectBlock({ index }: { index: number }) {
  return (
    <div className="resume-pdf-subsection mb-2 min-w-0">
      <EditableText
        path={`projects.${index}.name`}
        mode="inline"
        inlineWrap
        className="resume-entry-primary block w-full min-w-0 text-base font-bold"
        editorClassName="whitespace-normal break-words py-0 leading-snug"
        placeholder="Project name"
      />
      <EditableText
        path={`projects.${index}.description`}
        mode="block"
        className="text-muted-foreground mt-1 w-full min-w-0 text-sm leading-relaxed"
        placeholder="Short project description"
      />
      <BulletList expIdx={index} section="projects" />
    </div>
  );
}
