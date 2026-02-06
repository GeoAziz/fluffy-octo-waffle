'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import type { Listing } from '@/lib/types';
import { useEffect, useState, useTransition } from 'react';
import { searchListingsAction } from '@/app/actions';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

const LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Mixed-Use"];

export default function ListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [listings, setListings] = useState<Listing[]>([]);
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [landType, setLandType] = useState(searchParams.get('landType') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);

  const debouncedUpdateParams = useDebouncedCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('query', query); else params.delete('query');
    if (landType) params.set('landType', landType); else params.delete('landType');
    params.set('minPrice', String(priceRange[0]));
    params.set('maxPrice', String(priceRange[1]));
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, 500);

  useEffect(() => {
    const minPrice = Number(searchParams.get('minPrice') || '0');
    const maxPrice = Number(searchParams.get('maxPrice') || '50000000');
    setQuery(searchParams.get('query') || '');
    setLandType(searchParams.get('landType') || '');
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = {
      query: searchParams.get('query') || undefined,
      landType: searchParams.get('landType') || undefined,
      minPrice: Number(searchParams.get('minPrice') || 0),
      maxPrice: Number(searchParams.get('maxPrice') || 50000000),
      limit: 8,
    };
    
    searchListingsAction(params).then(result => {
      setListings(result.listings);
      setLastVisibleId(result.lastVisibleId);
      setHasMore(result.listings.length > 0 && !!result.lastVisibleId);
      setLoading(false);
    });
  }, [searchParams]);


  const handleLoadMore = async () => {
    if (!lastVisibleId || !hasMore) return;
    setLoadingMore(true);

    const params = {
      query: searchParams.get('query') || undefined,
      landType: searchParams.get('landType') || undefined,
      minPrice: Number(searchParams.get('minPrice') || 0),
      maxPrice: Number(searchParams.get('maxPrice') || 50000000),
      limit: 8,
      startAfter: lastVisibleId,
    };
    
    const result = await searchListingsAction(params);
    setListings(prev => [...prev, ...result.listings]);
    setLastVisibleId(result.lastVisibleId);
    setHasMore(result.listings.length > 0 && !!result.lastVisibleId);
    setLoadingMore(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Secure Your Piece of Kenya
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Browse verified land listings with transparent trust signals.
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 p-4 border rounded-lg bg-card grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
            <Label htmlFor="search-query">Search by County</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    id="search-query"
                    placeholder="e.g., Kajiado"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); debouncedUpdateParams(); }}
                    className="pl-10"
                />
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="land-type">Land Type</Label>
            <Select value={landType} onValueChange={(value) => { setLandType(value === 'all' ? '' : value); debouncedUpdateParams(); }}>
                <SelectTrigger id="land-type">
                    <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {LAND_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
           <Label>Price Range (Ksh)</Label>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{priceRange[0].toLocaleString()}</span>
                <span>{priceRange[1].toLocaleString()}+</span>
            </div>
            <Slider
                value={[priceRange[1]]}
                onValueChange={(value) => { setPriceRange([priceRange[0], value[0]]); }}
                onValueCommit={debouncedUpdateParams}
                max={50000000}
                step={100000}
            />
        </div>
      </div>


      {(loading || isPending) && listings.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <CardHeader className="relative p-0">
                  <Link href={`/listings/${listing.id}`} className="block">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      width={600}
                      height={400}
                      className="aspect-[3/2] w-full object-cover"
                      data-ai-hint={listing.imageHint}
                    />
                  </Link>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={listing.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <Link href={`/listings/${listing.id}`}>
                    <CardTitle className="mb-2 text-xl font-medium tracking-tight hover:text-accent">
                      {listing.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-base text-muted-foreground">
                    {listing.location}, {listing.county}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <p className="text-2xl font-semibold text-primary">
                    Ksh {listing.price.toLocaleString()}
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/listings/${listing.id}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
           {hasMore && (
                <div className="mt-12 text-center">
                    <Button onClick={handleLoadMore} disabled={loadingMore}>
                        {loadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </Button>
                </div>
            )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No listings found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
