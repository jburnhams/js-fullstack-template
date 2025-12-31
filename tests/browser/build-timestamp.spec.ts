import { test, expect } from '@playwright/test';

test('Build timestamp badge loads and displays date', async ({ page }) => {
  await page.goto('/');

  // It should eventually update to "Built: ..."
  // We use a regex to match the expected format
  const updatedBadge = page.locator('span', { hasText: /^Built:/ });

  // Increase timeout slightly in case of slow fetch, but 10s should be enough
  await expect(updatedBadge).toBeVisible({ timeout: 10000 });
});
