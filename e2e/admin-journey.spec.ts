import { test, expect } from '@playwright/test';

/**
 * Admin Journey Tests
 * Tests admin-specific route protection for unauthenticated users.
 */

test.describe('Admin Journey - Route Protection', () => {
  test('admin console redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login/);
  });

  test('admin settings redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin/settings');

    await expect(page).toHaveURL(/\/login/);
  });
});
