'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ListingsContent } from '@/components/buyer/listings-content';

/**
 * ExplorePage - Dedicated page for browsing and filtering listings
 * Focuses on search and discovery without hero/educational sections
 * Good for users who know what they're looking for
 */

function LoadingFallback() {
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Advanced Property Search
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            This page is focused on discovery with full filters. For a guided overview and marketplace introduction, use the home page.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tip: start broad, then narrow by land type, price, and badge confidence.
          </p>
        </div>

        {/* Listings with Filters */}
        <Suspense fallback={<LoadingFallback />}>
          <ListingsContent />
        </Suspense>
      </div>
    </div>
  );
}
