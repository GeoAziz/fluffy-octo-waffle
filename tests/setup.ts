import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Custom render function that wraps components with common providers
 * Extend this as you add more global providers (themes, auth context, etc.)
 */
const AllTheProviders = ({ children }: { children: ReactNode }): React.ReactElement => {
  return React.createElement('div', null, children);
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

/**
 * Setup function for user interactions in tests
 * Returns the user object from @testing-library/user-event with all methods
 */
export const createUser = () => userEvent.setup();

/**
 * Mock authenticated user for server action tests
 */
export const mockAuthenticatedUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  role: 'BUYER' as const,
  createdAt: new Date(),
  verified: true,
  displayName: 'Test User',
  ...overrides,
});

/**
 * Mock admin user for admin-specific tests
 */
export const mockAdminUser = (overrides = {}) =>
  mockAuthenticatedUser({
    role: 'ADMIN',
    uid: 'admin-123',
    email: 'admin@example.com',
    ...overrides,
  });

/**
 * Mock seller user
 */
export const mockSellerUser = (overrides = {}) =>
  mockAuthenticatedUser({
    role: 'SELLER',
    uid: 'seller-123',
    email: 'seller@example.com',
    ...overrides,
  });

/**
 * Mock listing object
 */
export const mockListing = (overrides = {}) => ({
  id: 'listing-123',
  title: 'Test Property',
  description: 'A beautiful test property',
  price: 3500000,
  area: 0.5,
  location: 'Ruiru, Kiambu',
  county: 'Kiambu',
  landType: 'Residential',
  status: 'approved' as const,
  badge: 'Gold' as const,
  ownerId: 'seller-123',
  images: [{ url: 'https://example.com/image.jpg', hint: 'Main image' }],
  evidence: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  viewCount: 100,
  ...overrides,
});

/**
 * Mock evidence object
 */
export const mockEvidence = (overrides = {}) => ({
  id: 'evidence-123',
  listingId: 'listing-123',
  ownerId: 'seller-123',
  type: 'title_deed' as const,
  storagePath: 'gs://bucket/evidence/test.pdf',
  uploadedAt: new Date(),
  verified: true,
  verifiedAt: new Date(),
  verifiedBy: 'admin-123',
  ...overrides,
});

// re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };
export { customRender as render };
