import { test, expect } from "@playwright/test";

test.describe("App Browser Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the session endpoint
    await page.route("https://storage.jonathanburnhams.com/api/session", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                id: "session_123",
                user_id: 1,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 3600000).toISOString(),
                last_used_at: new Date().toISOString(),
                user: {
                    id: 1,
                    email: "browser@example.com",
                    name: "Browser User",
                    profile_picture: null,
                    is_admin: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_login_at: new Date().toISOString(),
                }
            })
        });
    });
  });

  test("displays user info when logged in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Browser User")).toBeVisible();
    await expect(page.getByText("browser@example.com")).toBeVisible();
  });

  test("calculates correctly", async ({ page }) => {
    await page.goto("/");

    const inputA = page.getByLabel("First Number");
    const inputB = page.getByLabel("Second Number");
    const submitBtn = page.getByRole("button", { name: "Calculate" });

    await inputA.fill("10");
    await inputB.fill("5");
    await submitBtn.click();

    await expect(page.locator(".bg-result-bg")).toBeVisible();
    await expect(page.getByText("15", { exact: true })).toBeVisible();
  });
});

test.describe("App Browser Tests - Unauthorized", () => {
    test("redirects when unauthorized", async ({ page }) => {
        await page.route("https://storage.jonathanburnhams.com/api/session", async (route) => {
            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({
                    error: "UNAUTHORIZED",
                    message: "Authentication required",
                    login_url: "https://storage.jonathanburnhams.com/auth/login"
                })
            });
        });

        // Mock the redirect destination
        await page.route("https://storage.jonathanburnhams.com/auth/login*", async (route) => {
            await route.fulfill({
                status: 200,
                body: "Login Page"
            });
        });

        await page.goto("/");

        // Check that we redirected
        await expect(page).toHaveURL(/storage\.jonathanburnhams\.com\/auth\/login/);
        await expect(page).toHaveURL(/redirect_url=/);
    });
});
