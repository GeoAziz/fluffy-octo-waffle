import { Page } from '@playwright/test';

export class LandingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async clickBrowseListings() {
    await this.page.click('button:has-text("Browse")');
  }

  async clickSignUp() {
    await this.page.click('button:has-text("Sign Up")');
  }

  async clickLogin() {
    await this.page.click('button:has-text("Login")');
  }

  async isBadgeLegendVisible() {
    return await this.page.isVisible('text=Trust Badges');
  }

  async getTrustBadges() {
    return await this.page.$$('text=/Gold|Silver|Bronze/');
  }

  async getHeroText() {
    return await this.page.textContent('h1');
  }

  async hasTestimonials() {
    return await this.page.isVisible('text=Verified');
  }

  async clickBadgeLegendModal() {
    const button = this.page.locator('button:has-text("Learn")');
    await button.click();
  }

  async closeBadgeLegendModal() {
    await this.page.keyboard.press('Escape');
  }
}
