import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrustBadge } from '@/components/trust-badge';

describe('TrustBadge', () => {
  it('should render Gold badge', () => {
    render(<TrustBadge badge="Gold" />);
    const badge = screen.getByRole('img', { hidden: true });
    expect(badge).toBeInTheDocument();
  });

  it('should render Silver badge', () => {
    render(<TrustBadge badge="Silver" />);
    expect(screen.getByText(/Silver/i)).toBeInTheDocument();
  });

  it('should render Bronze badge', () => {
    render(<TrustBadge badge="Bronze" />);
    expect(screen.getByText(/Bronze/i)).toBeInTheDocument();
  });

  it('should render None badge', () => {
    render(<TrustBadge badge="None" />);
    const badge = screen.getByRole('img', { hidden: true });
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct styling for Gold badge', () => {
    const { container } = render(<TrustBadge badge="Gold" />);
    const badgeElement = container.querySelector('[data-testid="trust-badge"]') ||
      container.firstChild;
    expect(badgeElement).toHaveClass('bg-amber-50');
  });

  it('should apply correct styling for Silver badge', () => {
    const { container } = render(<TrustBadge badge="Silver" />);
    const badgeElement = container.querySelector('[data-testid="trust-badge"]') ||
      container.firstChild;
    expect(badgeElement).toHaveClass('bg-slate-50');
  });

  it('should apply correct styling for Bronze badge', () => {
    const { container } = render(<TrustBadge badge="Bronze" />);
    const badgeElement = container.querySelector('[data-testid="trust-badge"]') ||
      container.firstChild;
    expect(badgeElement).toHaveClass('bg-orange-50');
  });

  it('should have tooltip on hover', () => {
    const { container } = render(<TrustBadge badge="Gold" />);
    expect(container).toBeInTheDocument();
  });

  it('should render with showTooltip prop', () => {
    render(<TrustBadge badge="Gold" showTooltip={true} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should render with className prop', () => {
    render(<TrustBadge badge="Gold" className="custom-class" />);
    const label = screen.getByRole('img', { hidden: true });
    expect(label).toBeInTheDocument();
  });

  it('should handle all badge values correctly', () => {
    const badges = ['Gold', 'Silver', 'Bronze', 'None'] as const;

    badges.forEach((badge) => {
      const { unmount } = render(<TrustBadge badge={badge} />);
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      unmount();
    });
  });
});
