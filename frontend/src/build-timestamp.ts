const PLACEHOLDER = "__BUILD_TIMESTAMP__";

export function hydrateBuildTimestamp(): void {
  const badge = document.querySelector<HTMLElement>(
    `[data-build-timestamp="${PLACEHOLDER}"]`
  );

  if (!badge) {
    return;
  }

  const timestamp = badge.dataset.buildTimestamp;
  if (!timestamp || timestamp === PLACEHOLDER) {
    return;
  }

  try {
    const date = new Date(timestamp);
    const formatted = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
    badge.textContent = `Built: ${formatted}`;
  } catch {
    badge.textContent = "Build time unavailable";
  }
}
