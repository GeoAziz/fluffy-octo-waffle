import { test, expect } from '@playwright/test';

/**
 * Authorization Tests
 * Validates that protected routes correctly block unauthenticated access.
 * Role-to-role cross-access is tested at the middleware unit test level.
 */

test.describe('Authorization - Protected Route Access', () => {
  test('/profile requires authentication', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/favorites requires authentication', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/buyer/messages requires authentication', async ({ page }) => {
    await page.goto('/buyer/messages');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/buyer/onboarding requires authentication', async ({ page }) => {
    await page.goto('/buyer/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });

  test('public explore page does not require authentication', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
