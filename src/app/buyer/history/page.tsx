'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { EmptyState } from '@/components/empty-state';
import { TrustBadge } from '@/components/trust-badge';
import type { Listing } from '@/lib/types';

/**
 * Browsing History Page
 * 
 * Recently viewed listings with:
 * - Last viewing timestamp
 * - Price tracking (show changes since last visit)
 * - Quick save to favorites
 * - Quick contact option
 */
export default function HistoryPage() {
  const [history, setHistory] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch browsing history from Firebase
    // This is a placeholder implementation
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    // TODO: Call server action to clear history
    setHistory([]);
  };

  const handleRemoveItem = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
    // TODO: Call server action to remove from history
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Recently Viewed</h1>
          <p className="text-muted-foreground">Properties you've recently browsed</p>
        </div>

        <EmptyState
          icon={Clock}
          title="No browsing history yet"
          description="Start exploring verified land listings and your recently viewed properties will appear here. Track price changes and seller responses."
          actions={[
            { label: 'Start Exploring', href: '/explore' }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recently Viewed</h1>
          <p className="text-muted-foreground mt-1">You've viewed {history.length} propertie{history.length !== 1 ? 's' : ''}</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={handleClearHistory} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Image */}
            <div className="relative aspect-video bg-muted overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[0].url}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {/* Save to Favorites Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="pb-3">
              <div className="space-y-2">
                <Link href={`/listings/${listing.id}`}>
                  <CardTitle className="text-base hover:text-primary transition-colors line-clamp-2">
                    {listing.title}
                  </CardTitle>
                </Link>
                <div className="flex items-center gap-2">
                  <TrustBadge badge={listing.badge || 'None'} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price and Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {listing.price ? `KES ${listing.price.toLocaleString()}` : 'Price N/A'}
                  </span>
                  <Badge variant="outline">{listing.status}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {listing.area} acres • {listing.location}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="default" className="flex-1" asChild>
                  <Link href={`/listings/${listing.id}`}>View Details</Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href={`/listings/${listing.id}#contact`}>Contact</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
