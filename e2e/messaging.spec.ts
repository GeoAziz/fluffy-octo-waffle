import { test, expect } from '@playwright/test';

/**
 * Messaging System Tests
 * Validates that messaging routes are protected for unauthenticated users.
 */

test.describe('Messaging - Route Protection', () => {
  test('buyer messages page requires authentication', async ({ page }) => {
    await page.goto('/buyer/messages');

    await expect(page).toHaveURL(/\/login/);
  });

  test('seller messages page requires authentication', async ({ page }) => {
    await page.goto('/dashboard/messages');

    await expect(page).toHaveURL(/\/login/);
  });
});
