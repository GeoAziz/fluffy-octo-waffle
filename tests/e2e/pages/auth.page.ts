import { Page } from '@playwright/test';

export class SignUpPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/signup');
    await this.page.waitForLoadState('networkidle');
  }

  async selectRole(role: 'Buyer' | 'Seller') {
    await this.page.click(`radio >> text=${role}`);
  }

  async fillSignupForm(data: { email: string; password: string; name: string; phone?: string }) {
    await this.page.fill('input[type="email"]', data.email);
    await this.page.fill('input[placeholder*="Name"]', data.name);
 if (data.phone) {
      await this.page.fill('input[placeholder*="Phone"]', data.phone);
    }
    await this.page.fill('input[type="password"]', data.password);
  }

  async acceptTerms() {
    await this.page.click('input[type="checkbox"]');
  }

  async submitForm() {
    await this.page.click('button:has-text("Create")');
    await this.page.waitForLoadState('networkidle');
  }

  async hasErrorMessage() {
    return await this.page.isVisible('[data-testid="error-message"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }

  async canSignUpWithGoogle() {
    return await this.page.isVisible('button:has-text("Google")');
  }

  async redirectsToExpected() {
    // Check if redirected to appropriate page after signup
    return this.page.url().includes('/login') || this.page.url().includes('/dashboard');
  }
}

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillLoginForm(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
  }

  async submitForm() {
    await this.page.click('button:has-text("Login")');
    await this.page.waitForLoadState('networkidle');
  }

  async hasErrorMessage() {
    return await this.page.isVisible('[data-testid="error-message"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }

  async rememberMe() {
    await this.page.click('input[type="checkbox"]');
  }

  async redirectsToExplore() {
    return this.page.url().includes('/explore') || this.page.url().includes('/dashboard');
  }

  async canLoginWithGoogle() {
    return await this.page.isVisible('button:has-text("Google")');
  }
}
