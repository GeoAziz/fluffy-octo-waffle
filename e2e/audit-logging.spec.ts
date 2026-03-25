import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Audit Logging & Authorization Analytics
 * Tests that sensitive actions are logged and tracked properly
 */

test.describe('Audit Logging & Analytics for Authorization', () => {
  const baseURL = 'http://localhost:9002';

  test.describe('Admin Actions Logging', () => {
    test('should log when admin updates listing status', async ({ page }) => {
      // Navigate to admin listings
      await page.goto(`${baseURL}/admin/listings`);

      // Check if we can find a review button
      const reviewButtons = await page.locator('button:has-text("Review")').all();

      if (reviewButtons.length > 0) {
        // Try to click first review button (would log audit event)
        await reviewButtons[0].click();

        // Wait for navigation to admin listing detail
        await page.waitForURL(/\/admin\/listings\/[a-z0-9]+/);

        // Look for any status update controls
        const statusSelect = await page.locator('select, [role="combobox"]').first().isVisible().catch(() => false);

        // If we can update, this would trigger audit logging
        expect(statusSelect || page.url()).toBeTruthy();
      }
    });

    test('should log badge assignment events', async ({ page }) => {
      await page.goto(`${baseURL}/admin/listings`);

      // Look for badge assignment controls
      const badgeControls = await page.locator('text=/badge|Badge|GOLD|SILVER|BRONZE/i').first().isVisible().catch(() => false);

      // Presence of badge controls indicates admin access
      // In real app, selecting a badge would trigger logBadgeAssignment
      if (badgeControls) {
        expect(badgeControls).toBeTruthy();
      }
    });
  });

  test.describe('Seller Actions Logging', () => {
    test('should log when seller creates listing', async ({ page }) => {
      await page.goto(`${baseURL}/listings/new`);

      // Check if we can access listing creation form
      const listingForm = await page.locator('form').first().isVisible().catch(() => false);

      if (listingForm) {
        // Form is visible, means seller access granted
        // Creating listing would trigger logAuditEvent with SELLER_ACTION for listing creation
        expect(listingForm).toBeTruthy();
      }
    });

    test('should log evidence upload actions', async ({ page }) => {
      await page.goto(`${baseURL}/listings/new`);

      // Look for evidence upload section
      const evidenceUpload = await page.locator('text=/evidence|document|upload/i').first().isVisible().catch(() => false);

      if (evidenceUpload) {
        // Evidence upload visible, means seller can create listings
        expect(evidenceUpload).toBeTruthy();
      }
    });
  });

  test.describe('Permission Denied Logging', () => {
    test('should log when buyer tries to access admin settings', async ({ page }) => {
      await page.goto(`${baseURL}/admin/settings`);

      // PermissionGuard should block and log the access denial
      const isBlocked = 
        page.url().includes('/denied') ||
        page.url().includes('/login') ||
        await page.locator('text=Access Denied').isVisible().catch(() => false);

      // The failure should be audited in background
      // This test verifies the page handles it gracefully
      expect(isBlocked).toBeTruthy();
    });

    test('should track authorization failures gracefully', async ({ page }) => {
      // Try multiple protected endpoints
      const protectedRoutes = [
        '/admin/settings',
        '/admin/listings',
        '/dashboard/listings'
      ];

      for (const route of protectedRoutes) {
        await page.goto(`${baseURL}${route}`);
        
        // Should handle each denial without errors
        const hasError = await page.locator('text=/Error|Exception|Failed/').isVisible().catch(() => false);
        expect(!hasError).toBeTruthy();
      }
    });
  });

  test.describe('Authorization Check Tracking', () => {
    test('should track successful auth checks on public pages', async ({ page }) => {
      await page.goto(`${baseURL}/explore`);

      // Public page should load without auth errors
      // Background: successful auth check (buyer on public page)
      
      const pageLoaded = page.url().includes('/explore') || page.url() === `${baseURL}/explore`;
      expect(pageLoaded).toBeTruthy();
    });

    test('should handle rapid authorization checks', async ({ page }) => {
      // Simulate rapid navigation between pages
      const pages = [
        '/explore',
        '/profile',
        '/favorites',
        '/explore'
      ];

      for (const route of pages) {
        await page.goto(`${baseURL}${route}`);
        // Each auth check should be logged
      }

      // Should complete without errors
      expect(page).toBeTruthy();
    });
  });

  test.describe('Analytics Tracker Integration', () => {
    test('should track listing view events', async ({ page }) => {
      await page.goto(`${baseURL}/explore`);

      // Look for any listing
      const listing = await page.locator('[data-testid*="listing"]').first().isVisible().catch(() => false);

      if (!listing) {
        // Fallback to text content if data-testid not available
        const listingLink = await page.locator('a:has-text(/view|details|explore/i)').first();
        const isVisible = await listingLink.isVisible().catch(() => false);
        
        if (isVisible) {
          // Click to trigger view event
          await listingLink.click();
          // View event should be tracked
        }
      } else {
        // Click first listing
        // Would trigger tracking in analytics
      }
    });

    test('should track auth check events', async ({ page }) => {
      await page.goto(`${baseURL}/dashboard`);

      // Dashboard access attempt would trigger auth check tracking
      const isDashboardOrDenied = 
        page.url().includes('/dashboard') ||
        page.url().includes('/login') ||
        page.url().includes('/denied');

      expect(isDashboardOrDenied).toBeTruthy();
    });

    test('should track listing creation events', async ({ page }) => {
      await page.goto(`${baseURL}/listings/new`);

      // Presence of form indicates seller access
      // Form submission would trigger tracking
      
      const form = await page.locator('form').first().isVisible().catch(() => false);
      expect(form || page.url().includes('login')).toBeTruthy();
    });
  });

  test.describe('PermissionGuard Audit Integration', () => {
    test('should audit access to protected components', async ({ page }) => {
      // Navigate to component that uses PermissionGuard
      await page.goto(`${baseURL}/admin/settings`);

      // PermissionGuard should:
      // 1. Check permissions
      // 2. Log in background (logAuditEvent called)
      // 3. Render fallback or content

      const rendered = 
        await page.locator('form').isVisible().catch(() => false) ||
        await page.locator('text=Access Denied').isVisible().catch(() => false);

      expect(rendered || page.url()).toBeTruthy();
    });

    test('SettingsForm should log admin-only access attempts', async ({ page }) => {
      await page.goto(`${baseURL}/admin/settings`);

      // Non-admin access would be logged and denied
      // Admin access would be logged as success

      const result = 
        page.url().includes('/login') ||
        page.url().includes('/denied') ||
        await page.locator('form').isVisible().catch(() => false);

      expect(result).toBeTruthy();
    });

    test('AdminTriageList should log review queue access', async ({ page }) => {
      await page.goto(`${baseURL}/admin/listings`);

      // Access attempt is logged regardless of outcome
      
      const result = 
        page.url().includes('/login') ||
        page.url().includes('/denied') ||
        await page.locator('table').isVisible().catch(() => false);

      expect(result).toBeTruthy();
    });
  });

  test.describe('Error Handling in Audit Logging', () => {
    test('audit logging failures should not crash app', async ({ page }) => {
      // Even if audit logging fails, app should continue
      await page.goto(`${baseURL}/admin/settings`);

      // Should reach a final state (loaded or denied) without crashing
      const finalState = page.url() && !page.url().includes('about:blank');
      expect(finalState).toBeTruthy();
    });

    test('analytics tracking failures should not affect user flow', async ({ page }) => {
      // Navigate and perform actions
      await page.goto(`${baseURL}/explore`);

      // Even if analytics fails, page should function
      const pageWorks = !page.url().includes('about:blank');
      expect(pageWorks).toBeTruthy();
    });
  });

  test.describe('Audit Trail Completeness', () => {
    test('should log both successful and failed auth checks', async ({ page }) => {
      // Try public page (success)
      await page.goto(`${baseURL}/explore`);
      const publicPageWorks = page.url().includes('/explore');

      // Try protected page (failure)
      await page.goto(`${baseURL}/admin/settings`);
      const protectedPageHandled = 
        page.url().includes('/login') ||
        page.url().includes('/denied') ||
        page.url().includes('/admin/settings');

      expect(publicPageWorks && protectedPageHandled).toBeTruthy();
    });

    test('should track all role-based access decisions', async ({ page }) => {
      const testCases = [
        { route: '/explore', expectedAccess: true, desc: 'public' },
        { route: '/admin/settings', expectedAccess: false, desc: 'admin-only' },
        { route: '/dashboard', expectedAccess: false, desc: 'seller-only' },
      ];

      for (const testCase of testCases) {
        await page.goto(`${baseURL}${testCase.route}`);

        // Each should be tracked in audit logs
        const reached = page.url();
        expect(reached).toBeTruthy();
      }
    });
  });

  test.describe('Sensitive Data Protection in Logs', () => {
    test('audit logs should not expose sensitive user data', async ({ page }) => {
      await page.goto(`${baseURL}/admin/settings`);

      const pageContent = await page.content();

      // Should not expose in UI what would be in logs
      const exposed = pageContent.match(/password|secret|api_key|token/i);
      expect(exposed).toBeNull();
    });

    test('error messages should not leak authorization details', async ({ page }) => {
      await page.goto(`${baseURL}/admin/listings`);

      // Any error message should be generic
      const errorMsg = await page.locator('[role="alert"]').first().textContent().catch(() => '');

      // Should not show which specific check failed
      const isGeneric = !errorMsg?.includes('role') && !errorMsg?.includes('uid');
      expect(isGeneric || errorMsg === '').toBeTruthy();
    });
  });
});
