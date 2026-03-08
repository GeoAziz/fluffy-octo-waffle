'use client';

import { useEffect, useRef } from 'react';
import { recordListingViewAction } from '@/app/actions';

export function ViewTracker({ listingId }: { listingId: string }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      // Small timeout to avoid counting accidental brief misclicks
      const timer = setTimeout(() => {
        recordListingViewAction(listingId).catch(() => {
          // Silent fail for analytics
        });
        hasTracked.current = true;
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [listingId]);

  return null;
}
