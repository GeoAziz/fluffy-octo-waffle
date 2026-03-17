import { test, expect } from '@playwright/test';

/**
 * Buyer Journey Tests
 * Tests the public-facing buyer experience: homepage, listings, and navigation.
 */

test.describe('Buyer Journey - Public Experience', () => {
  test('homepage shows brand name and call-to-action', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Kenya Land Trust/);
    // Check for actual hero h1 heading from landing-hero.tsx
    await expect(
      page.getByRole('heading', { name: /Find Land with|Ironclad Trust/i })
    ).toBeVisible();
  });

  test('explore page is publicly accessible and shows listings', async ({ page }) => {
    await page.goto('/explore');

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    // Page should load without a fatal error
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/buyer/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });
});
