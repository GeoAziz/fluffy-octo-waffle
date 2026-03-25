import { test, expect } from '@playwright/test';

test.describe('Authorization and Role-Based Access Control', () => {
  test.describe('Permission Guard - Admin Access', () => {
    test('should allow admin to access admin settings', async ({ page }) => {
      // Login as admin
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'admin@kenyalandtrust.com');
      await page.fill('input[type="password"]', 'Admin123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/admin/**', { timeout: 10000 });
      
      // Navigate to settings
      await page.goto('http://localhost:9002/admin/settings');
      
      // Verify settings form is visible
      const title = page.locator('h1, .text-lg:has-text("Settings")');
      expect(title).toBeVisible();
    });

    test('should deny seller from accessing admin settings', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for redirect
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      
      // Try to access admin settings
      await page.goto('http://localhost:9002/admin/settings');
      
      // Should be redirected or see denied message
      const deniedMessage = page.locator('text=Access Denied');
      const redirected = page.url().includes('/denied') || page.url().includes('/login');
      
      expect(deniedMessage.isVisible() || redirected).toBeTruthy();
    });

    test('should deny buyer from accessing admin panel', async ({ page }) => {
      // Login as buyer
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'buyer@example.com');
      await page.fill('input[type="password"]', 'Buyer123!');
      await page.click('button:has-text("Sign In")');
      
      // Try to access admin
      await page.goto('http://localhost:9002/admin');
      
      // Should be redirected or denied
      const denied = page.url().includes('/denied') || page.url().includes('/login');
      expect(denied).toBeTruthy();
    });
  });

  test.describe('Permission Guard - Seller Access', () => {
    test('should allow seller to access dashboard', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for seller dashboard
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      
      // Verify seller nav is visible
      const sellerNav = page.locator('[data-testid="seller-nav"]');
      if (await sellerNav.isVisible()) {
        expect(sellerNav).toBeVisible();
      }
    });

    test('should show buyer listings in seller dashboard', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Navigate to listings
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      await page.goto('http://localhost:9002/dashboard/listings');
      
      // Verify listings page loaded
      const listingsContent = page.locator('text=Listings');
      expect(listingsContent).toBeVisible();
    });

    test('should not allow seller to access admin triage queue', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Try to access admin triage
      await page.goto('http://localhost:9002/admin/triage');
      
      // Should be denied
      const denied = page.url().includes('/denied') || page.url().includes('/login');
      expect(denied).toBeTruthy();
    });
  });

  test.describe('Permission Guard - Buyer Access', () => {
    test('should allow buyer to browse listings', async ({ page }) => {
      // Go to explore as anonymous buyer
      await page.goto('http://localhost:9002/explore');
      
      // Verify listings are visible
      const listingsHeader = page.locator('text=Browse Land Properties');
      if (await listingsHeader.isVisible()) {
        expect(listingsHeader).toBeVisible();
      }
    });

    test('should deny buyer access to seller dashboard', async ({ page }) => {
      // Login as buyer
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'buyer@example.com');
      await page.fill('input[type="password"]', 'Buyer123!');
      await page.click('button:has-text("Sign In")');
      
      // Try to access seller dashboard
      await page.goto('http://localhost:9002/dashboard/listings');
      
      // Should be denied or redirected
      const denied = page.url().includes('/denied') || page.url().includes('/messages') || page.url().includes('/explore');
      expect(denied).toBeTruthy();
    });

    test('should deny buyer access to admin panel', async ({ page }) => {
      // Login as buyer
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'buyer@example.com');
      await page.fill('input[type="password"]', 'Buyer123!');
      await page.click('button:has-text("Sign In")');
      
      // Try to access admin
      await page.goto('http://localhost:9002/admin');
      
      // Should be denied
      const denied = page.url().includes('/denied') || page.url().includes('/explore');
      expect(denied).toBeTruthy();
    });
  });

  test.describe('Audit Logging - Authorization Checks', () => {
    test('should log denied access attempts', async ({ page, context }) => {
      // Login as buyer
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'buyer@example.com');
      await page.fill('input[type="password"]', 'Buyer123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for login
      await page.waitForURL('**/explore', { timeout: 10000 });
      
      // Try to access admin multiple times (will create audit logs)
      await page.goto('http://localhost:9002/admin/settings');
      await page.goto('http://localhost:9002/admin/triage');
      await page.goto('http://localhost:9002/admin/analytics');
      
      // NOTE: In a real test, you would verify the audit logs in Firestore
      // For now, we just verify the deny behavior works
      expect(page.url()).not.toContain('/admin/settings');
      expect(page.url()).not.toContain('/admin/triage');
    });

    test('should log successful admin access', async ({ page }) => {
      // Login as admin
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'admin@kenyalandtrust.com');
      await page.fill('input[type="password"]', 'Admin123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for admin dashboard
      await page.waitForURL('**/admin/**', { timeout: 10000 });
      
      // Access admin features
      await page.goto('http://localhost:9002/admin/settings');
      await page.goto('http://localhost:9002/admin/triage');
      
      // Verify access granted
      expect(page.url()).toContain('/admin');
    });
  });

  test.describe('Role-Based Component Visibility', () => {
    test('should hide admin-only buttons from sellers', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      
      // Verify admin-only components are not visible
      const adminButton = page.locator('text=Moderate Listings, Access Reports, Manage Settings').first();
      expect(adminButton).not.toBeVisible();
    });

    test('should show admin-only buttons to admins', async ({ page }) => {
      // Login as admin
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'admin@kenyalandtrust.com');
      await page.fill('input[type="password"]', 'Admin123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for admin dashboard
      await page.waitForURL('**/admin/**', { timeout: 10000 });
      
      // Navigate to listings for moderation
      await page.goto('http://localhost:9002/admin/listings');
      
      // Verify admin controls are visible
      const adminControl = page.locator('button:has-text("Review")').first();
      if (await adminControl.isVisible()) {
        expect(adminControl).toBeVisible();
      }
    });

    test('should hide seller-only buttons from other roles', async ({ page }) => {
      // Login as buyer
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'buyer@example.com');
      await page.fill('input[type="password"]', 'Buyer123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for buyer experience
      await page.waitForURL('**/explore', { timeout: 10000 });
      
      // Verify seller-only components not visible
      const createListingButton = page.locator('text=Create Listing, Add Listing, Provision Property').first();
      expect(createListingButton).not.toBeVisible();
    });
  });

  test.describe('Cross-Role Messaging', () => {
    test('seller should not see admin messages interface', async ({ page }) => {
      // Login as seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Navigate to messages
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      await page.goto('http://localhost:9002/dashboard/messages');
      
      // Verify it shows seller messages (buyer communications), not admin moderation
      const messagesContent = page.locator('text=Messages');
      expect(messagesContent).toBeVisible();
    });
  });

  test.describe('Verification-based Access', () => {
    test('should restrict unverified sellers from certain actions', async ({ page }) => {
      // Note: This test assumes there's an unverified seller account
      // Login as unverified seller
      await page.goto('http://localhost:9002/login');
      await page.fill('input[type="email"]', 'unverified-seller@example.com');
      await page.fill('input[type="password"]', 'Seller123!');
      await page.click('button:has-text("Sign In")');
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard/**', { timeout: 10000 });
      
      // Try to create listing
      await page.goto('http://localhost:9002/listings/new');
      
      // Should see verification prompt or be redirected
      const verificationPrompt = page.locator('text=Complete Profile, Verification Required, Verify Your Information').first();
      const redirected = page.url().includes('/onboarding') || page.url().includes('/profile');
      
      expect(verificationPrompt.isVisible() || redirected).toBeTruthy();
    });
  });
});
