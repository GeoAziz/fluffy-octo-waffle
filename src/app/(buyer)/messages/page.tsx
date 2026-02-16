'use client';

import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';

export default function MessagesPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Select a conversation"
      description="Choose from your existing conversations on the left, or start a new one by contacting a seller on a listing page."
      actions={[{ label: 'Browse Listings', href: '/listings', variant: 'outline' }]}
      className="bg-card"
    />
  );
}
