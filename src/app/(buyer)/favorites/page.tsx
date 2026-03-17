'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { getListingsByIds } from '@/app/actions';
import type { Listing } from '@/lib/types';
import { ArrowUpDown, Heart, LandPlot, Scale, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { TrustBadge } from '@/components/trust-badge';
import { FavoriteButton } from '@/components/favorite-button';
import { ListingCardSkeleton } from '@/components/listing-card-skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/empty-state';

/**
 * FavoritesPage - Personalized registry of saved high-trust properties.
 * Uses role-standardized empty state for non-authenticated or zero-data users.
 */
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
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">My Favorites</h1>
      {listings.length > 0 ? (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Triage Protocol
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={sortBy === 'newest' ? 'default' : 'outline'} size="sm" className="h-8 text-[9px] font-black uppercase" onClick={() => setSortBy('newest')}>Newest</Button>
              <Button variant={sortBy === 'priceLow' ? 'default' : 'outline'} size="sm" className="h-8 text-[9px] font-black uppercase" onClick={() => setSortBy('priceLow')}>Price ↑</Button>
              <Button variant={sortBy === 'priceHigh' ? 'default' : 'outline'} size="sm" className="h-8 text-[9px] font-black uppercase" onClick={() => setSortBy('priceHigh')}>Price ↓</Button>
              <Button variant={sortBy === 'areaHigh' ? 'default' : 'outline'} size="sm" className="h-8 text-[9px] font-black uppercase" onClick={() => setSortBy('areaHigh')}>Area ↓</Button>
            </div>
          </div>

          {compareIds.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4 animate-in slide-in-from-top-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                Compare mode: {compareIds.length} / 3 Selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase" onClick={() => setCompareIds([])}>Flush Selection</Button>
                <Button size="sm" asChild disabled={compareIds.length < 2} className="h-8 text-[9px] font-black uppercase bg-accent text-white">
                  <Link href={`/explore?ids=${compareIds.join(',')}`}>Execute Analysis</Link>
                </Button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedListings.map((listing) => (
            <Card key={listing.id} className="flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-border/40 bg-card/50">
              <CardHeader className="relative p-0">
                <Link href={`/listings/${listing.id}`} className="block aspect-[3/2] relative overflow-hidden">
                  <Image
                    src={listing.images[0]?.url || 'https://picsum.photos/seed/fallback/600/400'}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-1000 hover:scale-110"
                    data-ai-hint={listing.images[0]?.hint || 'landscape'}
                  />
                </Link>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {listing.badge && <TrustBadge badge={listing.badge} animated={true} />}
                </div>
                <div className="absolute top-3 left-3 z-10 space-y-2">
                  <FavoriteButton listingId={listing.id} />
                  <label className="flex items-center gap-2 rounded-xl bg-background/90 px-2 py-1 text-[9px] font-black uppercase tracking-tighter shadow-xl backdrop-blur-sm cursor-pointer border border-border/40">
                    <Checkbox
                      checked={compareIds.includes(listing.id)}
                      disabled={!compareIds.includes(listing.id) && compareIds.length >= 3}
                      onCheckedChange={(checked) => toggleCompare(listing.id, checked)}
                    />
                    <Scale className="h-3 w-3" /> Compare
                  </label>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-5">
                <Link href={`/listings/${listing.id}`}>
                  <CardTitle className="mb-1 text-sm font-black uppercase tracking-tight leading-tight hover:text-accent transition-colors line-clamp-2">
                    {listing.title}
                  </CardTitle>
                </Link>
                <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-accent" />
                  {listing.location}
                </CardDescription>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-black">{listing.area}</span>
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Acres</span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black">KES {listing.price.toLocaleString()}</span>
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Handshake Value</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full h-10 font-black uppercase text-[10px] tracking-widest">
                  <Link href={`/listings/${listing.id}`}>Inspect Vault</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        </>
      ) : (
        <EmptyState
          icon="Heart"
          title="Favorites Vault Empty"
          description="Save high-trust listings to compare them later and maintain persistent transaction momentum."
          actions={[
            { label: 'Explore Registry Nodes', href: '/explore' },
            { label: 'View Gold Signals', href: '/explore?badges=TrustedSignal', variant: 'outline' },
          ]}
        />
      )}
    </div>
  );
}
