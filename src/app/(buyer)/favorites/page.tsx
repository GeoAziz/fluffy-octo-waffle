'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { getListingsByIds } from '@/app/actions';
import type { Listing } from '@/lib/types';
import { ArrowUpDown, LandPlot, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { TrustBadge } from '@/components/trust-badge';
import { FavoriteButton } from '@/components/favorite-button';
import { ListingCardSkeleton } from '@/components/listing-card-skeleton';
import { Checkbox } from '@/components/ui/checkbox';

export default function FavoritesPage() {
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'priceLow' | 'priceHigh' | 'areaHigh'>('newest');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    if (favoritesLoading) return;

    setLoading(true);
    const ids = Array.from(favoriteIds);

    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    getListingsByIds(ids).then((favoriteListings) => {
      setListings(favoriteListings);
      setLoading(false);
    });
  }, [favoriteIds, favoritesLoading]);


  const sortedListings = useMemo(() => {
    const next = [...listings];
    if (sortBy === 'priceLow') return next.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHigh') return next.sort((a, b) => b.price - a.price);
    if (sortBy === 'areaHigh') return next.sort((a, b) => b.area - a.area);
    return next;
  }, [listings, sortBy]);

  const toggleCompare = (listingId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    setCompareIds((prev) => {
      if (isChecked && prev.length >= 3) return prev;
      if (isChecked) return [...prev, listingId];
      return prev.filter((id) => id !== listingId);
    });
  };

  if (loading || favoritesLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Favorites</h1>
      {listings.length > 0 ? (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" />
              Sort favorites
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={sortBy === 'newest' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('newest')}>Newest</Button>
              <Button variant={sortBy === 'priceLow' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('priceLow')}>Price ↑</Button>
              <Button variant={sortBy === 'priceHigh' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('priceHigh')}>Price ↓</Button>
              <Button variant={sortBy === 'areaHigh' ? 'default' : 'outline'} size="sm" onClick={() => setSortBy('areaHigh')}>Area ↓</Button>
            </div>
          </div>

          {compareIds.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm">
                <span className="font-semibold">Compare mode:</span> {compareIds.length} selected (up to 3).
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setCompareIds([])}>Clear</Button>
                <Button size="sm" asChild disabled={compareIds.length < 2}>
                  <Link href={`/explore?ids=${compareIds.join(',')}`}>Compare selected</Link>
                </Button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedListings.map((listing) => (
            <Card key={listing.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="relative p-0">
                <Link href={`/listings/${listing.id}`} className="block">
                  <Image
                    src={listing.images[0]?.url || 'https://picsum.photos/seed/fallback/600/400'}
                    alt={listing.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover"
                    data-ai-hint={listing.images[0]?.hint || 'landscape'}
                  />
                </Link>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {listing.badge && <TrustBadge badge={listing.badge} />}
                  <StatusBadge status={listing.status} />
                </div>
                <div className="absolute top-3 left-3 z-10 space-y-2">
                  <FavoriteButton listingId={listing.id} />
                  <label className="inline-flex items-center gap-2 rounded-md bg-background/90 px-2 py-1 text-xs shadow">
                    <Checkbox
                      checked={compareIds.includes(listing.id)}
                      disabled={!compareIds.includes(listing.id) && compareIds.length >= 3}
                      onCheckedChange={(checked) => toggleCompare(listing.id, checked)}
                    />
                    <Scale className="h-3.5 w-3.5" /> Compare
                  </label>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <Link href={`/listings/${listing.id}`}>
                  <CardTitle className="mb-1 text-lg font-semibold tracking-tight hover:text-accent leading-tight">
                    {listing.title}
                  </CardTitle>
                </Link>
                <CardDescription className="text-sm text-muted-foreground">
                  {listing.location}, {listing.county}
                </CardDescription>
                <p className="text-sm text-foreground/80 mt-2 flex items-center gap-2">
                  <LandPlot className="h-4 w-4 text-accent" />
                  {listing.area} Acres
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-xl font-bold text-primary">
                  Ksh {listing.price.toLocaleString()}
                </p>
                <Button asChild>
                  <Link href={`/listings/${listing.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        </>
      ) : (
        <div className="text-center py-20 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground text-lg font-medium">You have no favorite listings yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Save listings to compare them later and return faster to the best options.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/explore">Explore properties</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/explore?landType=Residential">View Residential</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/explore?landType=Agricultural">View Agricultural</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/explore?badges=Gold">Gold badge listings</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
