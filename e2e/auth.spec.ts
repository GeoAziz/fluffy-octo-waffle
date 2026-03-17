import { test, expect } from '@playwright/test';

/**
 * Authentication Flow Tests
 * Tests public auth pages and redirect behavior for unauthenticated users.
 * These tests run without a live Firebase connection.
 */

test.describe('Authentication Pages', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Check for branded login headings (use first to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: /Vault Access|Identity/i }).first()).toBeVisible();
    await expect(page.getByLabel(/email|Network Email/i)).toBeVisible();
    // Use textbox role to avoid matching the "Show password" button
    await expect(page.getByRole('textbox', { name: /Access Token/i })).toBeVisible();
  });

  test('signup page renders with registration form', async ({ page }) => {
    await page.goto('/signup');

    // Check for branded signup headings (use first to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: /Vault Creation|Provision/i }).first()).toBeVisible();
    await expect(page.getByLabel(/email|Communication Email/i)).toBeVisible();
  });

  test('protected route redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/login/);
  });
});
