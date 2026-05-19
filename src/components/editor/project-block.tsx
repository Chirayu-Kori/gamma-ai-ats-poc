"use client";

import { EditableText } from "./EditableText";
import { BulletList } from "./BulletList";

export function ProjectBlock({ index }: { index: number }) {
  return (
    <div className="mb-2">
      <EditableText
        path={`projects.${index}.name`}
        mode="inline"
        className="text-base font-bold"
        placeholder="Project name"
      />
      <EditableText
        path={`projects.${index}.description`}
        mode="block"
        className="text-muted-foreground mt-1 text-sm leading-relaxed"
        placeholder="Short project description"
      />
      <BulletList expIdx={index} section="projects" />
    </div>
  );
}
