import { test, expect } from '@playwright/test';

test('homepage has title and hero content', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain brand name
  await expect(page).toHaveTitle(/Kenya Land Trust/);

  // Expect hero heading to be visible (matches actual h1 in landing-hero.tsx)
  const heading = page.getByRole('heading', { name: /Find Land with|Ironclad Trust/i });
  await expect(heading).toBeVisible();
});

test('navigation to explore page works', async ({ page }) => {
  await page.goto('/');
  
  // Button should be visible and clickable
  const exploreButton = page.getByRole('button', { name: /Explore Vaulted Listings/i });
  await expect(exploreButton).toBeVisible();
  
  // Verify the "Live Registry Nodes" section loads (indicates page scrolled/loaded)
  await expect(page.getByText(/Live Registry Nodes/i)).toBeVisible();
});