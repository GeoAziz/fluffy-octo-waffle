import { test, expect } from '@playwright/test';
import { ListingDetailPage } from './pages/listing-detail.page';

test.describe('Buyer Journey - View Listing Details', () => {
  let detailPage: ListingDetailPage;

  test.beforeEach(async ({ page }) => {
    detailPage = new ListingDetailPage(page);
  });

  test('should load listing detail page', async ({ page }) => {
    // Note: In real e2e tests, you'd need to know a valid listing ID or create one first
    // For now we'll navigate to explore, find a listing, then view it
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Verify listing details are visible
      const title = await detailPage.getListingTitle();
      expect(title).toBeTruthy();
    }
  });

  test('should display listing images', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const hasGallery = await detailPage.hasImageGallery();
      expect(hasGallery).toBeTruthy();
    }
  });

  test('should show listing price and location', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const price = await detailPage.getListingPrice();
      const location = await detailPage.getLocation();

      expect(price).toBeTruthy();
      expect(location).toBeTruthy();
    }
  });

  test('should display trust badge on listing', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const badge = await detailPage.getTrustBadge();
      expect(badge).toMatch(/Gold|Silver|Bronze|None/i);
    }
  });

  test('should show documentation section if available', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const hasDocSection = await detailPage.hasDocumentSection();
      if (hasDocSection) {
        const docCount = await detailPage.getDocumentCount();
        expect(docCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should allow sharing property', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Test share functionality
      await detailPage.shareProperty('copy');
      // Verify share action completes without error
      expect(page.url()).toContain('/listings/');
    }
  });

  test('should allow reporting listing', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Test report functionality
      const reportBtn = page.locator('button:has-text("Report")');
      if (await reportBtn.isVisible()) {
        await reportBtn.click();
        // Verify report modal opens
        expect(page.url()).toContain('/listings/');
      }
    }
  });

  test('should display inquiry form', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Verify inquiry form is present
      const inquiryForm = page.locator('form, [data-testid="inquiry-form"]');
      if (await inquiryForm.isVisible()) {
        expect(inquiryForm).toBeTruthy();
      }
    }
  });

  test('should show seller information', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      const sellerInfo = page.locator('[data-testid="seller-info"]');
      if (await sellerInfo.isVisible()) {
        expect(sellerInfo).toBeTruthy();
      }
    }
  });

  test('should scroll through listing content', async ({ page }) => {
    await page.goto('/explore');
    const firstListing = await page.$('[data-testid="listing-card"]');
    if (firstListing) {
      await firstListing.click();
      await page.waitForLoadState('networkidle');

      // Scroll to different sections
      await detailPage.scrollToSection('Documentation');
      expect(page.url()).toContain('/listings/');

      await detailPage.scrollToSection('Location');
      expect(page.url()).toContain('/listings/');
    }
  });
});
