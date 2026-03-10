import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../status-badge';

describe('StatusBadge Component', () => {
  it('renders correctly for approved status', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders correctly for pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders correctly for rejected status', () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});