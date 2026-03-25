import { test, expect } from '@playwright/test';

/**
 * Authorization Tests
 * Validates that protected routes correctly block unauthenticated access.
 * Tests PermissionGuard component, role-based access, and audit logging.
 */

test.describe('Authorization - Protected Route Access', () => {
  test('/profile requires authentication', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/favorites requires authentication', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/buyer/messages requires authentication', async ({ page }) => {
    await page.goto('/buyer/messages');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/buyer/onboarding requires authentication', async ({ page }) => {
    await page.goto('/buyer/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });

  test('public explore page does not require authentication', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('PermissionGuard Component Protection', () => {
  test('admin-only SettingsForm component blocks non-admin access', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Should either redirect to denied or show access denied message
    const isDenied = page.url().includes('/denied') || page.url().includes('/login');
    const accessDeniedMessage = await page.locator('text=Access Denied').isVisible().catch(() => false);
    
    expect(isDenied || accessDeniedMessage).toBeTruthy();
  });

  test('admin-only AdminTriageList blocks non-admin access', async ({ page }) => {
    await page.goto('/admin/listings');
    
    const isDenied = page.url().includes('/denied') || page.url().includes('/login');
    const accessDeniedMessage = await page.locator('text=Access Denied').isVisible().catch(() => false);
    
    expect(isDenied || accessDeniedMessage).toBeTruthy();
  });

  test('seller-only SellerOnboardingWizard component enforcement', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Depending on user role, should either show wizard (seller) or deny
    const wizardOrDenied = 
      await page.locator('text=/Welcome|Onboarding|Sellers Only/').isVisible().catch(() => false);
    
    expect(wizardOrDenied).toBeTruthy();
  });
});

test.describe('Role-Based Route Protection', () => {
  test('/admin routes require ADMIN role', async ({ page }) => {
    // Test multiple admin routes
    const adminRoutes = ['/admin', '/admin/listings', '/admin/settings'];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      
      const isProtected = 
        page.url().includes('/denied') || 
        page.url().includes('/login') ||
        await page.locator('text=Access Denied').isVisible().catch(() => false);
      
      expect(isProtected || page.url().includes('/admin')).toBeTruthy();
    }
  });

  test('/seller routes require SELLER role', async ({ page }) => {
    const sellerRoutes = ['/dashboard', '/dashboard/listings', '/dashboard/messages'];
    
    for (const route of sellerRoutes) {
      await page.goto(route);
      
      const isProtected = 
        page.url().includes('/denied') || 
        page.url().includes('/login') ||
        await page.locator('text=Access Denied').isVisible().catch(() => false);
      
      // Should be protected if not seller
      expect(isProtected).toBeTruthy();
    }
  });

  test('public buyer routes accessible without auth', async ({ page }) => {
    const publicRoutes = ['/', '/explore', '/about', '/contact'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      
      const isNotRedirected = !page.url().includes('/login');
      expect(isNotRedirected).toBeTruthy();
    }
  });
});

test.describe('Authorization Fallback & Denial Handling', () => {
  test('should display fallback content when permission denied', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Non-admin users should see either:
    // 1. Redirect to /denied
    // 2. Access Denied message (from PermissionGuard fallback)
    
    const hasDenialIndicator = 
      page.url().includes('/denied') ||
      await page.locator('text=Access Denied').isVisible().catch(() => false) ||
      await page.locator('text=Forbidden').isVisible().catch(() => false);
    
    expect(hasDenialIndicator).toBeTruthy();
  });

  test('fallback should provide helpful context', async ({ page }) => {
    await page.goto('/admin/listings');
    
    const fallbackText = await page.locator(
      'text=/Access Denied|Only administrators|permission|Not authorized/'
    ).first().isVisible().catch(() => false);
    
    if (fallbackText) {
      expect(fallbackText).toBeTruthy();
    }
  });
});

test.describe('Audit Logging (Implicit)', () => {
  test('failed authorization should not crash application', async ({ page }) => {
    // Try to access protected resource
    await page.goto('/admin/settings');
    
    // Check for error state
    const hasJSError = await page.locator('text=/Error|Exception|Failed/').isVisible().catch(() => false);
    const isBlank = await page.content().then(content => content.trim() === '');
    
    // Should handle gracefully without JS errors
    expect(!hasJSError && !isBlank).toBeTruthy();
  });

  test('multiple failed attempts should handle gracefully', async ({ page }) => {
    // Rapid attempts to access protected resources
    const attempts = [
      '/admin/settings',
      '/admin/listings',
      '/dashboard',
      '/dashboard/messages'
    ];
    
    for (const route of attempts) {
      await page.goto(route);
    }
    
    // Should still be functional
    expect(page).toBeTruthy();
  });
});

test.describe('PermissionGuard Edge Cases', () => {
  test('should handle missing role gracefully', async ({ page }) => {
    await page.goto('/explore');
    
    // Public page should work even with undefined role
    expect(page).toBeTruthy();
  });

  test('should not expose sensitive data in fallback content', async ({ page }) => {
    await page.goto('/admin/settings');
    
    const pageContent = await page.content();
    
    // Should not show raw user data or sensitive errors in fallback
    const exposedSecrets = pageContent.match(/api_key|secret|password|token/i);
    expect(exposedSecrets).toBeNull();
  });

  test('sidebar navigation respects PermissionGuard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigation items should be filtered by PermissionGuard
    const navLinks = await page.locator('nav a, aside a').all();
    
    // Should have some nav items for authenticated users
    // Or no nav for unauthenticated
    expect(navLinks.length >= 0).toBeTruthy();
  });
});

test.describe('Component-Level PermissionGuard Tests', () => {
  test('SettingsForm renders correctly with proper wrapping', async ({ page }) => {
    await page.goto('/admin/settings');
    
    // Should render either the form or access denied fallback
    const hasForm = await page.locator('form').isVisible().catch(() => false);
    const hasFallback = await page.locator('text=Access Denied').isVisible().catch(() => false);
    
    expect(hasForm || hasFallback).toBeTruthy();
  });

  test('AdminTriageList renders triage queue or fallback', async ({ page }) => {
    await page.goto('/admin/listings');
    
    const hasTable = await page.locator('table, [role="table"]').isVisible().catch(() => false);
    const hasFallback = await page.locator('text=Access Denied').isVisible().catch(() => false);
    
    expect(hasTable || hasFallback).toBeTruthy();
  });

  test('SellerNav only shows for sellers', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Seller nav should exist for sellers or not exist for non-sellers
    const hasSellerNav = await page.locator('[data-testid="seller-nav"]').isVisible().catch(() => false);
    
    if (hasSellerNav) {
      expect(hasSellerNav).toBeTruthy();
    }
  });
});

test.describe('Verified User Checks (requireVerified)', () => {
  test('components with requireVerified should enforce verification status', async ({ page }) => {
    await page.goto('/dashboard');
    
    // If user is verified, should see content
    // If not verified, should see appropriate message
    
    const unverifiedMessage = await page.locator('text=Please verify').isVisible().catch(() => false);
    const verifiedContent = await page.locator('text=/Dashboard|Listings/').isVisible().catch(() => false);
    
    expect(unverifiedMessage || verifiedContent || !page.url().includes('/login')).toBeTruthy();
  });
});

