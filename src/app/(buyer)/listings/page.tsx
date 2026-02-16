import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ListingsContent } from '@/components/buyer/listings-content';

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

export default function ListingsBrowsePage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Listings Browse
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Search verified properties by location, price, size, and documentation level.
          </p>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <ListingsContent />
        </Suspense>
      </div>
    </div>
  );
}
