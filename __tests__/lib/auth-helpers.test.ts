import { describe, it, expect } from 'vitest';
import { validateRedirect } from '../../src/lib/utils';

describe('validateRedirect - security and role isolation', () => {
  describe('Invalid path rejection', () => {
    it('should return null for a null path', () => {
      expect(validateRedirect(null, 'BUYER')).toBeNull();
    });

    it('should return null for an absolute URL (open redirect prevention)', () => {
      expect(validateRedirect('https://malicious.com/steal', 'BUYER')).toBeNull();
    });

    it('should return null for a protocol-relative URL (open redirect prevention)', () => {
      expect(validateRedirect('//evil.com', 'BUYER')).toBeNull();
    });
  });

  describe('Admin path isolation', () => {
    it('should block BUYER from accessing /admin paths', () => {
      expect(validateRedirect('/admin/settings', 'BUYER')).toBeNull();
    });

    it('should block SELLER from accessing /admin paths', () => {
      expect(validateRedirect('/admin/users', 'SELLER')).toBeNull();
    });

    it('should allow ADMIN to access /admin paths', () => {
      expect(validateRedirect('/admin/settings', 'ADMIN')).toBe('/admin/settings');
    });
  });

  describe('Seller path isolation', () => {
    it('should block BUYER from accessing /dashboard paths', () => {
      expect(validateRedirect('/dashboard', 'BUYER')).toBeNull();
    });

    it('should allow SELLER to access /dashboard paths', () => {
      expect(validateRedirect('/dashboard/listings', 'SELLER')).toBe(
        '/dashboard/listings'
      );
    });

    it('should allow ADMIN to access /dashboard paths', () => {
      expect(validateRedirect('/dashboard', 'ADMIN')).toBe('/dashboard');
    });
  });

  describe('Buyer path isolation', () => {
    it('should block SELLER from accessing /buyer paths', () => {
      expect(validateRedirect('/buyer/dashboard', 'SELLER')).toBeNull();
    });

    it('should block ADMIN from accessing /buyer paths', () => {
      expect(validateRedirect('/buyer/messages', 'ADMIN')).toBeNull();
    });

    it('should allow BUYER to access /buyer paths', () => {
      expect(validateRedirect('/buyer/dashboard', 'BUYER')).toBe('/buyer/dashboard');
    });
  });

  describe('Public path access', () => {
    it('should allow any role to access public paths like /explore', () => {
      expect(validateRedirect('/explore', 'BUYER')).toBe('/explore');
      expect(validateRedirect('/explore', 'SELLER')).toBe('/explore');
      expect(validateRedirect('/explore', 'ADMIN')).toBe('/explore');
    });
  });
});
