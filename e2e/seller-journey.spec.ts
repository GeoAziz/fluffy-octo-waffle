import { test, expect } from '@playwright/test';

/**
 * Seller Journey Tests
 * Tests seller-specific route protection for unauthenticated users.
 */

test.describe('Seller Journey - Route Protection', () => {
  test('seller dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  test('create listing page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/listings/new');

    await expect(page).toHaveURL(/\/login/);
  });
});
