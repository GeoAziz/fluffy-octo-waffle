import { describe, it, expect } from 'vitest';
import {
  getPrimaryWorkspace,
  getRoleAwareDashboardPath,
  getWorkspaceSwitchTargets,
} from '../../src/lib/workspace-navigation';
import { calculateSellerTier, getTierProgress } from '../../src/lib/seller-tier';

describe('Workspace Navigation - Role Helpers', () => {
  describe('getPrimaryWorkspace', () => {
    it('should return ADMIN workspace for ADMIN role', () => {
      const workspace = getPrimaryWorkspace('ADMIN');
      expect(workspace).not.toBeNull();
      expect(workspace!.href).toBe('/admin');
    });

    it('should return SELLER workspace for SELLER role', () => {
      const workspace = getPrimaryWorkspace('SELLER');
      expect(workspace).not.toBeNull();
      expect(workspace!.href).toBe('/dashboard');
    });

    it('should return BUYER workspace for BUYER role', () => {
      const workspace = getPrimaryWorkspace('BUYER');
      expect(workspace).not.toBeNull();
      expect(workspace!.href).toBe('/buyer/dashboard');
    });

    it('should return null when role is undefined', () => {
      expect(getPrimaryWorkspace(undefined)).toBeNull();
    });
  });

  describe('getRoleAwareDashboardPath', () => {
    it('should return /admin for ADMIN role', () => {
      expect(getRoleAwareDashboardPath('ADMIN')).toBe('/admin');
    });

    it('should return /dashboard for SELLER role', () => {
      expect(getRoleAwareDashboardPath('SELLER')).toBe('/dashboard');
    });

    it('should return /buyer/dashboard for BUYER role', () => {
      expect(getRoleAwareDashboardPath('BUYER')).toBe('/buyer/dashboard');
    });

    it('should return /login when role is undefined', () => {
      expect(getRoleAwareDashboardPath(null)).toBe('/login');
    });
  });

  describe('getWorkspaceSwitchTargets', () => {
    it('should return only buyer workspace for BUYER', () => {
      const targets = getWorkspaceSwitchTargets('BUYER');
      expect(targets).toHaveLength(1);
      expect(targets[0].href).toBe('/buyer/dashboard');
    });

    it('should return workspace options for SELLER', () => {
      const targets = getWorkspaceSwitchTargets('SELLER');
      expect(targets.length).toBeGreaterThanOrEqual(1);
      expect(targets.some((t) => t.href === '/dashboard')).toBe(true);
    });
  });
});

describe('Seller Tier Calculation', () => {
  it('should return Unverified when no badges', () => {
    expect(calculateSellerTier([])).toBe('Unverified');
  });

  it('should return Gold when 50%+ of badges are TrustedSignal', () => {
    const badges = ['TrustedSignal', 'TrustedSignal', 'EvidenceReviewed'] as any[];
    expect(calculateSellerTier(badges)).toBe('Gold');
  });

  it('should return Silver when majority are EvidenceReviewed+', () => {
    const badges = ['EvidenceReviewed', 'EvidenceReviewed', 'EvidenceSubmitted'] as any[];
    expect(calculateSellerTier(badges)).toBe('Silver');
  });

  it('should return correct tier progress percentage', () => {
    expect(getTierProgress('Gold')).toBe(100);
    expect(getTierProgress('Silver')).toBe(70);
    expect(getTierProgress('Bronze')).toBe(30);
    expect(getTierProgress('Unverified')).toBe(0);
  });
});
