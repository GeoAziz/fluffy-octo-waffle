import { Page } from '@playwright/test';

export class ListingDetailPage {
  constructor(private page: Page) {}

  async goto(listingId: string) {
    await this.page.goto(`/listings/${listingId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async getListingTitle() {
    return await this.page.textContent('[data-testid="listing-title"]');
  }

  async getListingPrice() {
    return await this.page.textContent('[data-testid="listing-price"]');
  }

  async getTrustBadge() {
    return await this.page.textContent('[data-testid="trust-badge"]');
  }

  async getLocation() {
    return await this.page.textContent('[data-testid="listing-location"]');
  }

  async clickFavoriteButton() {
    const button = this.page.locator('[data-testid="favorite-button"]');
    await button.click();
  }

  async isFavorited() {
    const button = this.page.locator('[data-testid="favorite-button"]');
    return await button.locator('svg').evaluate((el) => window.getComputedStyle(el).fill);
  }

  async fillInquiryForm(name: string, email: string, message: string) {
    await this.page.fill('input[placeholder*="Name"]', name);
    await this.page.fill('input[placeholder*="Email"]', email);
    await this.page.fill('textarea[placeholder*="Message"]', message);
  }

  async submitInquiry() {
    await this.page.click('button:has-text("Send")');
    await this.page.waitForLoadState('networkidle');
  }

  async hasDocumentSection() {
    return await this.page.isVisible('text=Documentation');
  }

  async getDocumentCount() {
    const docs = await this.page.$$('[data-testid="evidence-item"]');
    return docs.length;
  }

  async viewDocument(index: number) {
    const buttons = await this.page.$$('[data-testid="view-document"]');
    await buttons[index].click();
  }

  async scrollToSection(section: string) {
    await this.page.locator(`text=${section}`).scrollIntoViewIfNeeded();
  }

  async shareProperty(method: 'whatsapp' | 'email' | 'copy') {
    const shareButton = this.page.locator('[data-testid="share-button"]');
    await shareButton.click();
    await this.page.click(`button:has-text("${method}")`);
  }

  async reportListing() {
    await this.page.click('button:has-text("Report")');
  }

  async hasImageGallery() {
    return await this.page.isVisible('[data-testid="image-gallery"]');
  }

  async getImageCount() {
    return await this.page.$$eval('[data-testid="gallery-image"]', (els) => els.length);
  }
}
