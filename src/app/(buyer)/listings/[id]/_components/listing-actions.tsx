'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Copy, Flag } from 'lucide-react';

export function ListingActions({ listingId }: { listingId: string }) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (typeof window === 'undefined') return;
    setIsCopying(true);
    try {
      const shareUrl = `${window.location.origin}/listings/${listingId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        variant: 'success',
        title: 'Link copied',
        description: 'Share this listing with your agent or lawyer.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Please copy the URL from the address bar.',
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} disabled={isCopying}>
        <Copy className="mr-2 h-4 w-4" />
        {isCopying ? 'Copying...' : 'Share'}
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href={`/report?listingId=${listingId}`}>
          <Flag className="mr-2 h-4 w-4" />
          Report listing
        </Link>
      </Button>
    </div>
  );
}
