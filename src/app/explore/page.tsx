'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ListingsContent } from '@/components/buyer/listings-content';

/**
 * ExplorePage - Dedicated Advanced Search Interface
 * Differentiated from the homepage by its focus on deep filtering and exhaustive results.
 */

function LoadingFallback() {
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Global Registry...</p>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header - Clearly differentiates from home */}
        <div className="mb-12 border-b border-border/40 pb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Advanced Registry Search
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Search our complete vault of verified properties. Use the refining tools below to filter by documentation quality, price precision, and specific county signals.
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
