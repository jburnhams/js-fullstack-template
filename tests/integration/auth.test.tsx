import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { App } from "../../frontend/src/App";
import { server } from "./setup";
import { unauthorizedHandlers } from "../mocks/handlers";

describe("App Integration", () => {
  it("displays user info when logged in", async () => {
    render(<App />);

    // Check if user name appears (from handlers.ts mock)
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("redirects when unauthorized", async () => {
    // Override handlers to return 401
    server.use(...unauthorizedHandlers);

    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: "http://localhost:3000" } as any;

    render(<App />);

    await waitFor(() => {
      expect(window.location.href).toContain("https://storage.jonathanburnhams.com/auth/login");
      expect(window.location.href).toContain("redirect_url=http%3A%2F%2Flocalhost%3A3000");
    });

    // Restore window.location
    window.location = originalLocation;
  });
});
