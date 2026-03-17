import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures these variables are initialised before the vi.mock factory runs
const { mockRedirect, mockNext } = vi.hoisted(() => ({
  mockRedirect: vi.fn((url: URL | string) => ({
    type: 'redirect',
    url: typeof url === 'string' ? url : url.toString(),
  })),
  mockNext: vi.fn(() => ({ type: 'next' })),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

import { middleware } from '../src/middleware';
import { createMockRequest } from '../tests/utils/test-helpers';

describe('Middleware - Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Pass-through routes', () => {
    it('should skip middleware for _next static paths', () => {
      const req = createMockRequest('/_next/static/chunk.js');
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should skip middleware for files with extensions', () => {
      const req = createMockRequest('/favicon.ico');
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should allow public homepage without session', () => {
      const req = createMockRequest('/');
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Authentication enforcement', () => {
    it('should redirect unauthenticated user from /profile to /login', () => {
      const req = createMockRequest('/profile');
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/login');
    });

    it('should redirect unauthenticated user from /favorites to /login', () => {
      const req = createMockRequest('/favorites');
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/login');
    });
  });

  describe('Role-based access control - Admin routes', () => {
    it('should block BUYER from /admin and redirect to /denied', () => {
      const req = createMockRequest('/admin', {
        __session: 'valid-session',
        __user_role: 'BUYER',
      });
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/denied');
    });

    it('should allow ADMIN to access /admin', () => {
      const req = createMockRequest('/admin', {
        __session: 'valid-session',
        __user_role: 'ADMIN',
      });
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Role-based access control - Seller routes', () => {
    it('should block BUYER from /dashboard and redirect to /denied', () => {
      const req = createMockRequest('/dashboard', {
        __session: 'valid-session',
        __user_role: 'BUYER',
      });
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/denied');
    });

    it('should allow SELLER to access /dashboard', () => {
      const req = createMockRequest('/dashboard', {
        __session: 'valid-session',
        __user_role: 'SELLER',
      });
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Role-based access control - Buyer routes', () => {
    it('should redirect SELLER from /buyer/dashboard to /dashboard', () => {
      const req = createMockRequest('/buyer/dashboard', {
        __session: 'valid-session',
        __user_role: 'SELLER',
      });
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/dashboard');
    });

    it('should redirect ADMIN from /buyer/dashboard to /admin', () => {
      const req = createMockRequest('/buyer/dashboard', {
        __session: 'valid-session',
        __user_role: 'ADMIN',
      });
      middleware(req);
      expect(mockRedirect).toHaveBeenCalledOnce();
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/admin');
    });

    it('should allow BUYER to access /buyer/dashboard', () => {
      const req = createMockRequest('/buyer/dashboard', {
        __session: 'valid-session',
        __user_role: 'BUYER',
      });
      middleware(req);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
