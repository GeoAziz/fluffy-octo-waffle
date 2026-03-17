import { vi } from 'vitest';
import type { UserProfile } from '../../src/lib/types';

export const mockBuyerProfile: UserProfile = {
  uid: 'buyer-uid-001',
  email: 'buyer@test.com',
  displayName: 'Test Buyer',
  photoURL: null,
  phone: null,
  bio: null,
  role: 'BUYER',
  createdAt: new Date('2024-01-01'),
  verified: true,
  hasCompletedOnboarding: true,
};

export const mockNewBuyerProfile: UserProfile = {
  uid: 'buyer-uid-002',
  email: 'newbuyer@test.com',
  displayName: 'New Buyer',
  photoURL: null,
  phone: null,
  bio: null,
  role: 'BUYER',
  createdAt: new Date('2024-01-01'),
  verified: true,
  hasCompletedOnboarding: false,
};

export const mockSellerProfile: UserProfile = {
  uid: 'seller-uid-001',
  email: 'seller@test.com',
  displayName: 'Test Seller',
  photoURL: null,
  phone: null,
  bio: null,
  role: 'SELLER',
  createdAt: new Date('2024-01-01'),
  verified: true,
  enabledForSelling: true,
};

export const mockAdminProfile: UserProfile = {
  uid: 'admin-uid-001',
  email: 'admin@test.com',
  displayName: 'Test Admin',
  photoURL: null,
  phone: null,
  bio: null,
  role: 'ADMIN',
  createdAt: new Date('2024-01-01'),
  verified: true,
};

export const mockFirebaseUser = {
  uid: 'buyer-uid-001',
  email: 'buyer@test.com',
  displayName: 'Test Buyer',
  getIdToken: vi.fn(() => Promise.resolve('mock-id-token')),
};
