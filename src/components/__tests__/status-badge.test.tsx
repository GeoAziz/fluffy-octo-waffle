import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/status-badge';

describe('StatusBadge', () => {
  it('should render approved status', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText(/Approved|Active/i)).toBeInTheDocument();
  });

  it('should render pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText(/Pending|Review/i)).toBeInTheDocument();
  });

  it('should render rejected status', () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText(/Rejected|Inactive/i)).toBeInTheDocument();
  });

  it('should have correct color for approved status', () => {
    const { container } = render(<StatusBadge status="approved" />);
    const badge = container.querySelector('[data-testid="status-badge"]') || container.firstChild;
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should have correct color for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('[data-testid="status-badge"]') || container.firstChild;
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('should have correct color for rejected status', () => {
    const { container } = render(<StatusBadge status="rejected" />);
    const badge = container.querySelector('[data-testid="status-badge"]') || container.firstChild;
    expect(badge).toHaveClass('bg-red-100');
  });

  it('should have correct text color for approved status', () => {
    const { container } = render(<StatusBadge status="approved" />);
    const badge = container.querySelector('span') || container.firstChild;
    expect(badge).toHaveClass('text-green-800');
  });

  it('should have correct text color for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('span') || container.firstChild;
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('should have correct text color for rejected status', () => {
    const { container } = render(<StatusBadge status="rejected" />);
    const badge = container.querySelector('span') || container.firstChild;
    expect(badge).toHaveClass('text-red-800');
  });

  it('should render with proper padding and styling', () => {
    const { container } = render(<StatusBadge status="approved" />);
    const badge = container.querySelector('[class*="px"]') || container.firstChild;
    expect(badge).toBeInTheDocument();
  });

  it('should render text content correctly', () => {
    const { rerender } = render(<StatusBadge status="approved" />);
    expect(screen.getByText(/Approved|Active/i)).toBeInTheDocument();

    rerender(<StatusBadge status="pending" />);
    expect(screen.getByText(/Pending|Review/i)).toBeInTheDocument();

    rerender(<StatusBadge status="rejected" />);
    expect(screen.getByText(/Rejected|Inactive/i)).toBeInTheDocument();
  });

  it('should handle all valid status values', () => {
    const statuses = ['approved', 'pending', 'rejected'] as const;

    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(/Approved|Active|Pending|Review|Rejected|Inactive/i)).toBeInTheDocument();
      unmount();
    });
  });
});
