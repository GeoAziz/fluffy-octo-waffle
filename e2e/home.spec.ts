import { test, expect } from '@playwright/test';

test('homepage has title and hero content', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain brand name
  await expect(page).toHaveTitle(/Kenya Land Trust/);

  // Expect hero heading to be visible
  const heading = page.getByRole('heading', { name: /Find Verified Land in Kenya/i });
  await expect(heading).toBeVisible();
});

test('navigation to explore page works', async ({ page }) => {
  await page.goto('/');
  
  // Click browse listings button
  await page.getByRole('button', { name: /Browse Listings/i }).click();
  
  // Expect to be on explore section or page
  await expect(page).toHaveURL(/.*#listings-section|.*explore/);
});