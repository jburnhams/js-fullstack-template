import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { BuildTimestampBadge } from "../../frontend/src/components/BuildTimestampBadge";

describe("BuildTimestampBadge", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows default text initially", () => {
    // Mock a never-resolving fetch or just verify initial render
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    render(<BuildTimestampBadge />);
    expect(screen.getByText("Build time unavailable")).toBeInTheDocument();
  });

  it("fetches and formats valid timestamp", async () => {
    const timestamp = "2025-01-15T10:30:00.000Z";
    const mockResponse = {
      ok: true,
      json: async () => ({ timestamp }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<BuildTimestampBadge />);

    await waitFor(() => {
        expect(screen.getByText(/Built:/)).toBeInTheDocument();
    });

    // Exact formatting depends on the locale, but we can check if it changed from default
    expect(screen.queryByText("Build time unavailable")).not.toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    render(<BuildTimestampBadge />);

    // Should stay as default text
    expect(await screen.findByText("Build time unavailable")).toBeInTheDocument();
  });

  it("handles invalid date in metadata gracefully", async () => {
     const mockResponse = {
      ok: true,
      json: async () => ({ timestamp: "invalid-date" }),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<BuildTimestampBadge />);

    expect(await screen.findByText("Build time unavailable")).toBeInTheDocument();
  });
});
