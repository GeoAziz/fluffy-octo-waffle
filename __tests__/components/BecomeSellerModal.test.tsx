import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/app/actions', () => ({
  requestSellerRoleAction: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

import { BecomeSellerModal } from '../../src/components/buyer/become-seller-modal';
import { requestSellerRoleAction } from '../../src/app/actions';

describe('BecomeSellerModal', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders info step with "Become a Seller" heading when open', () => {
    render(<BecomeSellerModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText('Become a Seller')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows seller benefits on the info step', () => {
    render(<BecomeSellerModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText('Create Multiple Listings')).toBeInTheDocument();
    expect(screen.getByText('Direct Buyer Messaging')).toBeInTheDocument();
  });

  it('advances to the agreement step when Continue is clicked', async () => {
    render(<BecomeSellerModal open={true} onOpenChange={mockOnOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Seller Agreement')).toBeInTheDocument();
    });
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls requestSellerRoleAction when seller agreement is accepted', async () => {
    vi.mocked(requestSellerRoleAction).mockResolvedValue(undefined as any);

    render(<BecomeSellerModal open={true} onOpenChange={mockOnOpenChange} />);

    // Advance to agreement step
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    // Accept terms
    fireEvent.click(screen.getByRole('checkbox'));

    // Submit
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /agree & become seller/i })
      );
    });

    await waitFor(() => {
      expect(requestSellerRoleAction).toHaveBeenCalledOnce();
    });
  });
});
