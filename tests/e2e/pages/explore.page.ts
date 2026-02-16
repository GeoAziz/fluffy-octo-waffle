import { Page } from '@playwright/test';

export class ExploreListingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/explore');
    await this.page.waitForLoadState('networkidle');
  }

  async searchByLocation(location: string) {
    await this.page.fill('input[placeholder*="Location"]', location);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCounty(county: string) {
    await this.page.click('select');
    await this.page.click(`option:has-text("${county}")`);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPriceRange(min: number, max: number) {
    const minInput = this.page.locator('input[placeholder*="Min"]').first();
    const maxInput = this.page.locator('input[placeholder*="Max"]').last();

    await minInput.fill(min.toString());
    await maxInput.fill(max.toString());
    await this.page.waitForLoadState('networkidle');
  }

  async filterByBadge(badge: 'Gold' | 'Silver' | 'Bronze') {
    await this.page.click(`text=${badge}`);
    await this.page.waitForLoadState('networkidle');
  }

  async getListingCount() {
    const count = await this.page.textContent('text=/showing/i');
    return count ? parseInt(count.match(/\d+/)?.[0] || '0') : 0;
  }

  async clickFirstListing() {
    await this.page.click('[data-testid="listing-card"]');
  }

  async sortBy(option: string) {
    await this.page.selectOption('select[name="sort"]', option);
    await this.page.waitForLoadState('networkidle');
  }

  async hasFilterSidebar() {
    return await this.page.isVisible('[data-testid="filter-sidebar"]');
  }

  async hasListingGrid() {
    return await this.page.isVisible('[data-testid="listings-grid"]');
  }

  async getListingTitles() {
    return await this.page.$$eval('[data-testid="listing-card"] h3', (els) =>
      els.map((el) => el.textContent)
    );
  }

  async clearFilters() {
    const button = this.page.locator('button:has-text("Clear")');
    if (await button.isVisible()) {
      await button.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}
