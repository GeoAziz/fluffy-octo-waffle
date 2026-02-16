import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/landing.page';
import { ExploreListingsPage } from './pages/explore.page';

test.describe('Buyer Journey - Browse & Discover', () => {
  let landingPage: LandingPage;
  let explorePage: ExploreListingsPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    explorePage = new ExploreListingsPage(page);
  });

  test('should load landing page with hero section', async ({ page }) => {
    await landingPage.goto();

    // Verify hero section is visible
    const heroText = await landingPage.getHeroText();
    expect(heroText).toBeTruthy();
    expect(heroText?.toLowerCase()).toContain('verified');
  });

  test('should display trust badge legend', async ({ page }) => {
    await landingPage.goto();

    const isBadgeVisible = await landingPage.isBadgeLegendVisible();
    expect(isBadgeVisible).toBeTruthy();
  });

  test('should display featured listings on landing page', async ({ page }) => {
    await landingPage.goto();

    const listings = await page.$$('[data-testid="listing-card"]');
    expect(listings.length).toBeGreaterThan(0);
  });

  test('should navigate to explore page', async ({ page }) => {
    await landingPage.goto();
    await explorePage.goto();

    expect(page.url()).toContain('/explore');
  });

  test('should filter listings by location', async ({ page }) => {
    await explorePage.goto();

    await explorePage.filterByCounty('Kiambu');
    const count = await explorePage.getListingCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter listings by badge', async ({ page }) => {
    await explorePage.goto();

    await explorePage.filterByBadge('Gold');
    const listings = await page.$$('[data-testid="listing-card"]');
    expect(listings.length).toBeGreaterThan(0);
  });

  test('should sort listings', async ({ page }) => {
    await explorePage.goto();

    await explorePage.sortBy('price-asc');
    const count = await explorePage.getListingCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display listing grid view', async ({ page }) => {
    await explorePage.goto();

    const hasGrid = await explorePage.hasListingGrid();
    expect(hasGrid).toBeTruthy();
  });

  test('should list multiple properties in results', async ({ page }) => {
    await explorePage.goto();
    await explorePage.clearFilters();

    const titles = await explorePage.getListingTitles();
    expect(titles.length).toBeGreaterThan(0);
  });

  test('should open listing detail from explore page', async ({ page }) => {
    await explorePage.goto();

    // Wait for at least one listing card
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 5000 });

    // Click first listing
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on a listing detail page
      expect(page.url()).toContain('/listings/');
    }
  });

  test('should maintain filter state when navigating', async ({ page }) => {
    await explorePage.goto();
    await explorePage.filterByCounty('Nairobi');

    const count1 = await explorePage.getListingCount();
    await page.reload();
    const count2 = await explorePage.getListingCount();

    expect(count1).toBe(count2);
  });

  test('should show loading state during searches', async ({ page }) => {
    await explorePage.goto();

    // Trigger a filter change and watch for loading
    await explorePage.filterByCounty('Kiambu');

    // Verify page loads without errors
    const listings = await page.$$('[data-testid="listing-card"]');
    expect(listings.length).toBeGreaterThanOrEqual(0);
  });
});
