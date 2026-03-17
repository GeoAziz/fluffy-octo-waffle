'use client';

import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

/**
 * Buyer messages index — shown when no conversation is selected.
 */
export default function BuyerMessagesPage() {
  return (
    <EmptyState
      icon="MessageSquare"
      title="Select a conversation"
      description="Choose from your existing conversations on the left, or start a new one by contacting a seller on a listing page."
      actions={[{ label: 'Browse Listings', href: '/explore', variant: 'outline' }]}
      className="bg-card"
    />
  );
}
