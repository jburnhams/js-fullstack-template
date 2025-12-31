import { test, expect } from "@playwright/test";

test("app works in browser", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Calculator App" })).toBeVisible();

  const inputA = page.getByLabel("First Number");
  const inputB = page.getByLabel("Second Number");
  const submitBtn = page.getByRole("button", { name: "Calculate" });

  await inputA.fill("10");
  await inputB.fill("5");
  await submitBtn.click();

  // Wait for result
  await expect(page.locator(".bg-result-bg")).toBeVisible();
  await expect(page.getByText("15")).toBeVisible();
  await expect(page.getByText("10 + 5 = 15")).toBeVisible();
});
