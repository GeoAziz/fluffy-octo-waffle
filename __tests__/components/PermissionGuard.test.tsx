import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseAuth = vi.fn();

vi.mock('@/components/providers', () => ({
  useAuth: () => mockUseAuth(),
}));

import { PermissionGuard } from '../../src/components/auth/permission-guard';

describe('PermissionGuard - Role-based UI visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ userProfile: null, loading: true });

    const { container } = render(
      <PermissionGuard allowedRoles={['BUYER']}>
        <div>Secret Content</div>
      </PermissionGuard>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders children when user has an allowed role', () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'BUYER', verified: true },
      loading: false,
    });

    render(
      <PermissionGuard allowedRoles={['BUYER', 'ADMIN']}>
        <div>Buyer Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Buyer Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have an allowed role', () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'BUYER', verified: true },
      loading: false,
    });

    render(
      <PermissionGuard
        allowedRoles={['ADMIN']}
        fallback={<div>Access Denied</div>}
      >
        <div>Admin Content</div>
      </PermissionGuard>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('blocks unverified users when requireVerified is true', () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'SELLER', verified: false },
      loading: false,
    });

    render(
      <PermissionGuard
        allowedRoles={['SELLER']}
        requireVerified={true}
        fallback={<div>Verification Required</div>}
      >
        <div>Seller Dashboard</div>
      </PermissionGuard>
    );

    expect(screen.queryByText('Seller Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Verification Required')).toBeInTheDocument();
  });
});
