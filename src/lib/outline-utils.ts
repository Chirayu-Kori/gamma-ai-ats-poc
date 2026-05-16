import type { OutlineBlock } from "@/lib/types/resume-outline";

export function bulletsToHtml(bullets: string[]): string {
  if (!bullets.length) return "";
  return `<ul>${bullets.map((b) => `<li><p>${escapeHtml(b)}</p></li>`).join("")}</ul>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlToBullets(html: string): string[] {
  if (typeof document === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const items = div.querySelectorAll("li");
  if (items.length === 0) {
    const text = div.textContent?.trim();
    return text ? [text] : [];
  }
  return Array.from(items)
    .map((li) => li.textContent?.trim() ?? "")
    .filter(Boolean);
}

export type EditableOutlineBlock = OutlineBlock & {
  sortId: string;
};

export function toEditableBlocks(
  blocks: OutlineBlock[],
): EditableOutlineBlock[] {
  return blocks.map((b) => ({
    ...b,
    sortId: `outline-${b.id}`,
  }));
}

/** Single TipTap document: title paragraph + optional bullet list */
export function blockToHtml(
  block: Pick<OutlineBlock, "title" | "bullets">,
): string {
  const title = block.title.trim();
  if (!title && !block.bullets?.length) return "";

  const titleHtml = title ? `<p>${escapeHtml(title)}</p>` : "";
  if (!block.bullets?.length) return titleHtml;

  return `${titleHtml}${bulletsToHtml(block.bullets)}`;
}

export function htmlToBlock(
  html: string,
): Pick<OutlineBlock, "title" | "bullets"> {
  if (typeof document === "undefined") {
    return { title: "", bullets: undefined };
  }

  const normalized = html.trim();
  if (!normalized || normalized === "<p></p>") {
    return { title: "", bullets: undefined };
  }

  const div = document.createElement("div");
  div.innerHTML = normalized;

  const ul = div.querySelector("ul");
  const bullets = ul
    ? Array.from(ul.querySelectorAll("li"))
        .map((li) => li.textContent?.trim() ?? "")
        .filter(Boolean)
    : undefined;

  if (ul) ul.remove();

  const title = div.textContent?.trim().replace(/\s+/g, " ") ?? "";

  return {
    title,
    bullets: bullets?.length ? bullets : undefined,
  };
}
