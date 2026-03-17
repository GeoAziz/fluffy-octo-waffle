import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * Tests public auth pages and redirect behavior for unauthenticated users.
 * These tests run without a live Firebase connection.
 */

test.describe('Authentication Pages', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('signup page renders with registration form', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /sign up|create account|register/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('protected route redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login/);
  });
});
