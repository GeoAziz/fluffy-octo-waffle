'use client';

import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

/**
 * Seller messages index — shown when no conversation is selected.
 */
export default function SellerMessagesPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Select a conversation"
      description="Choose from your existing buyer conversations on the left."
      actions={[{ label: 'View Listings', href: '/dashboard/listings', variant: 'outline' }]}
      className="bg-card"
    />
  );
}
