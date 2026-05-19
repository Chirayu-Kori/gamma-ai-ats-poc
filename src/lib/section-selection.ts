/** Returns true when the click target should not change section selection. */
export function isSectionSelectionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("[data-section-id]") ||
      target.closest("[data-section-ai]") ||
      target.closest('[role="menu"]') ||
      target.closest("[data-radix-popper-content-wrapper]"),
  );
}
