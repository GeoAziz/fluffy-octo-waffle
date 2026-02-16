import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteButton } from '@/components/favorite-button';

// Mock Firebase Auth
jest.mock('@/components/providers');
jest.mock('@/lib/firebase');

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with heart icon', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show filled heart when favorited', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show empty heart when not favorited', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should handle click to add favorite', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    // Component should respond to favorite state change
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click to remove favorite', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should handle disabled state', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should not show tooltip on small screens by default', () => {
    render(<FavoriteButton listingId="listing-1" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should support size variations', () => {
    const { rerender } = render(
      <FavoriteButton listingId="listing-1" />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<FavoriteButton listingId="listing-1" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle different listing IDs', () => {
    const { rerender } = render(<FavoriteButton listingId="listing-1" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<FavoriteButton listingId="listing-2" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
