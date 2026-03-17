import { test, expect } from '@playwright/test';

/**
 * Onboarding Flow Tests
 * Validates that onboarding routes are protected and the explore page is public.
 */

test.describe('Onboarding Flows', () => {
  test('onboarding page requires authentication for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/buyer/onboarding');

    await expect(page).toHaveURL(/\/login/);
  });

  test('explore page is accessible to unauthenticated visitors', async ({ page }) => {
    await page.goto('/explore');

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });
});
