import type { StreamSectionTarget } from "./stream-section-parser";

const HIGHLIGHT_ATTR = "data-streaming-highlight";

export function scrollToStreamSectionTarget(
  target: StreamSectionTarget,
  behavior: ScrollBehavior = "smooth",
) {
  const el = document.querySelector(`[data-section-type="${target}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior, block: "center", inline: "nearest" });
}

export function clearStreamingSectionHighlights() {
  document
    .querySelectorAll(`[${HIGHLIGHT_ATTR}]`)
    .forEach((node) => node.removeAttribute(HIGHLIGHT_ATTR));
}

export function applyStreamingSectionHighlight(target: StreamSectionTarget) {
  clearStreamingSectionHighlights();
  const el = document.querySelector(`[data-section-type="${target}"]`);
  if (!el) return;
  el.setAttribute(HIGHLIGHT_ATTR, "true");
  scrollToStreamSectionTarget(target);
}
