import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockUseAuth = vi.fn();
const mockUsePathname = vi.fn();

vi.mock('@/components/providers', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockUsePathname(),
}));

import { OnboardingGuard } from '../../src/components/buyer/onboarding-guard';

describe('OnboardingGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/buyer/dashboard');
  });

  it('shows a loading spinner while auth state is being determined', () => {
    mockUseAuth.mockReturnValue({ userProfile: null, loading: true });

    render(
      <OnboardingGuard>
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for non-buyer users (SELLER role)', async () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'SELLER', hasCompletedOnboarding: false },
      loading: false,
    });

    render(
      <OnboardingGuard>
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects a new BUYER who has not completed onboarding', async () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'BUYER', hasCompletedOnboarding: false },
      loading: false,
    });

    render(
      <OnboardingGuard>
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/buyer/onboarding');
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for a BUYER who has completed onboarding', async () => {
    mockUseAuth.mockReturnValue({
      userProfile: { role: 'BUYER', hasCompletedOnboarding: true },
      loading: false,
    });

    render(
      <OnboardingGuard>
        <div>Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
