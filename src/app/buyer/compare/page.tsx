'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { TrustBadge } from '@/components/trust-badge';

/**
 * Compare Page
 * 
 * Side-by-side comparison of saved properties
 * Allows buyers to compare up to 4 listings with:
 * - Price comparison
 * - Location/size comparison
 * - Trust badge comparison
 * - Difference highlights (price changes, badge upgrades)
 */
export default function ComparePage() {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch saved listings and those in compare mode
    // This is a placeholder
    setLoading(false);
  }, []);

  const handleRemoveListing = (id: string) => {
    setSelectedListings(selectedListings.filter(lid => lid !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading compare...</p>
        </div>
      </div>
    );
  }

  if (selectedListings.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Listings</h1>
          <p className="text-muted-foreground">Select up to 4 properties to compare side-by-side</p>
        </div>

        <EmptyState
          icon="Plus"
          title="No listings selected"
          description="Go back to your favorites and select listings to compare prices, locations, and trust signals."
          actions={[
            { label: 'View Favorites', href: '/favorites' }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Listings</h1>
        <p className="text-muted-foreground">
          Comparing {selectedListings.length} of 4 properties
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedListings.map((id) => (
          <Card key={id} className="relative overflow-hidden">
            {/* Remove button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveListing(id)}
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-2">
              {/* Placeholder for compare listing card */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <span className="text-muted-foreground text-sm">Listing {id}</span>
              </div>
              <CardTitle className="text-base">Property Title</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <TrustBadge badge="TrustedSignal" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Location details</span>
              </div>
              <div className="flex items-between justify-between">
                <span className="text-2xl font-bold">KES 0</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/listings/${id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add more button */}
        {selectedListings.length < 4 && (
          <Button
            variant="outline"
            className="h-full min-h-[300px] flex flex-col gap-2"
            asChild
          >
            <Link href="/favorites">
              <Plus className="h-6 w-6" />
              <span>Add listing</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Comparison Table */}
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-sm">Comparison Details</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left font-semibold py-2">Feature</th>
                {selectedListings.map((id) => (
                  <th key={id} className="text-right font-semibold py-2 px-4">
                    Listing {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 font-medium">Price</td>
                {selectedListings.map((id) => (
                  <td key={id} className="text-right py-3 px-4">
                    KES 0
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Area</td>
                {selectedListings.map((id) => (
                  <td key={id} className="text-right py-3 px-4">
                    0 acres
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 font-medium">Trust Badge</td>
                {selectedListings.map((id) => (
                  <td key={id} className="text-right py-3 px-4">
                    <TrustBadge badge="TrustedSignal" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 font-medium">Status</td>
                {selectedListings.map((id) => (
                  <td key={id} className="text-right py-3 px-4">
                    <Badge variant="outline">Approved</Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button asChild className="flex-1">
          <Link href={`/listings/${selectedListings[0]}`}>
            Contact Best Match
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/favorites">Adjust Selection</Link>
        </Button>
      </div>
    </div>
  );
}
