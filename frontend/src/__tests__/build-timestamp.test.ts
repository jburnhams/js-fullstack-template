import { describe, expect, it, beforeEach } from "vitest";
import { hydrateBuildTimestamp } from "../build-timestamp";

describe("build-timestamp", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing when badge element is not found", () => {
    expect(() => hydrateBuildTimestamp()).not.toThrow();
  });

  it("does nothing when timestamp is empty", () => {
    document.body.innerHTML = `
      <span data-build-timestamp="">
        Build time unavailable
      </span>
    `;
    hydrateBuildTimestamp();
    const badge = document.querySelector("span");
    expect(badge?.textContent?.trim()).toBe("Build time unavailable");
  });

  it("formats valid timestamp", () => {
    const timestamp = "2025-01-15T10:30:00.000Z";
    document.body.innerHTML = `
      <span data-build-timestamp="${timestamp}">
        Build time unavailable
      </span>
    `;
    hydrateBuildTimestamp();
    const badge = document.querySelector("span");
    expect(badge?.textContent).toContain("Built:");
  });

  it("handles invalid timestamp gracefully", () => {
    document.body.innerHTML = `
      <span data-build-timestamp="invalid-date">
        Build time unavailable
      </span>
    `;
    hydrateBuildTimestamp();
    const badge = document.querySelector("span");
    expect(badge?.textContent).toBe("Build time unavailable");
  });
});
