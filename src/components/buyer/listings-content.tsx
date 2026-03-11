'use client';

import { useEffect, useState, useTransition, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TrustBadge } from '@/components/trust-badge';
import { FavoriteButton } from '@/components/favorite-button';
import { ListingCardSkeleton } from '@/components/listing-card-skeleton';
import { EmptyState } from '@/components/empty-state';
import { StaggerContainer } from '@/components/animations/stagger-container';
import { Loader2, Search, SlidersHorizontal, X, LandPlot, ChevronDown, CheckCircle2 } from 'lucide-react';
import { searchListingsAction } from '@/app/actions';
import type { Listing, BadgeValue } from '@/lib/types';
import { SaveSearchButton } from './save-search-button';
import { cn } from '@/lib/utils';

const LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Mixed-Use"];
const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kiambu', 'Kajiado', 'Machakos', 'Nakuru', 'Uasin Gishu', 'Kisumu',
  'Nyeri', 'Meru', 'Laikipia', 'Murang\'a', 'Kilifi', 'Kwale', 'Kakamega', 'Bungoma',
];
const BADGE_OPTIONS: BadgeValue[] = ["TrustedSignal", "EvidenceReviewed", "EvidenceSubmitted", "Suspicious"];

const badgeLabelMap: Record<BadgeValue, string> = {
  TrustedSignal: "Trusted Signal",
  EvidenceReviewed: "Evidence Reviewed",
  EvidenceSubmitted: "Evidence Submitted",
  Suspicious: "Flagged Suspicious",
  None: "No Badge"
};

type SortOption = "newest" | "priceLow" | "priceHigh" | "areaHigh";

export function ListingsContent() {
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [listings, setListings] = useState<Listing[]>([]);
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('');
  const [landType, setLandType] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 100]);
  const [badges, setBadges] = useState<BadgeValue[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (query) filters.push({type: 'query', value: query, label: `Search: ${query}`});
    if (county) filters.push({type: 'county', value: county, label: `County: ${county}`});
    if (landType) filters.push({type: 'landType', value: landType, label: `Type: ${landType}`});
    if (priceRange[0] > 0 || priceRange[1] < 50000000) filters.push({type: 'price', value: priceRange, label: `Price Range`});
    if (areaRange[0] > 0 || areaRange[1] < 100) filters.push({type: 'area', value: areaRange, label: `Area Range`});
    badges.forEach(b => filters.push({type: 'badge', value: b, label: badgeLabelMap[b]}));
    return filters;
  }, [query, county, landType, priceRange, areaRange, badges]);
  
  const currentFilters = useMemo(() => ({
    query: query || undefined,
    county: county || undefined,
    landType: landType || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minArea: areaRange[0],
    maxArea: areaRange[1],
    badges: badges.length > 0 ? badges : undefined,
  }), [query, county, landType, priceRange, areaRange, badges]);

  const listingCountLabel = loading ? '...' : listings.length;

  const sortedListings = useMemo(() => {
    const next = [...listings];
    if (sortBy === 'priceLow') return next.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHigh') return next.sort((a, b) => b.price - a.price);
    if (sortBy === 'areaHigh') return next.sort((a, b) => b.area - a.area);
    return next;
  }, [listings, sortBy]);

  const updateUrlParams = useDebouncedCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) params.set('query', query); else params.delete('query');
    if (county) params.set('county', county); else params.delete('county');
    if (landType) params.set('landType', landType); else params.delete('landType');
    params.set('minPrice', String(priceRange[0]));
    params.set('maxPrice', String(priceRange[1]));
    params.set('minArea', String(areaRange[0]));
    params.set('maxArea', String(areaRange[1]));
    if (badges.length > 0) params.set('badges', badges.join(',')); else params.delete('badges');
    
    startTransition(() => {
      window.history.pushState(null, '', `${pathname}?${params.toString()}`);
    });
  }, 500);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get('query') || '');
    setCounty(params.get('county') || '');
    setLandType(params.get('landType') || '');
    setPriceRange([Number(params.get('minPrice') || 0), Number(params.get('maxPrice') || 50000000)]);
    setAreaRange([Number(params.get('minArea') || 0), Number(params.get('maxArea') || 100)]);
    setBadges(params.get('badges')?.split(',').filter(Boolean) as BadgeValue[] || []);
  }, [pathname]);

  useEffect(() => {
    setLoading(true);
    const params = {
      ...currentFilters,
      limit: 12,
    };
    
    searchListingsAction(params)
      .then(result => {
        setListings(result.listings);
        setLastVisibleId(result.lastVisibleId);
        setHasMore(result.listings.length > 0 && !!result.lastVisibleId);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load listings:', error);
        setListings([]);
        setLoading(false);
      });
  }, [currentFilters]);

  const handleLoadMore = async () => {
    if (!lastVisibleId || !hasMore) return;
    setLoadingMore(true);

    const params = {
      ...currentFilters,
      limit: 12,
      startAfter: lastVisibleId,
    };
    
    const result = await searchListingsAction(params);
    setListings(prev => [...prev, ...result.listings]);
    setLastVisibleId(result.lastVisibleId);
    setHasMore(result.listings.length > 0 && !!result.lastVisibleId);
    setLoadingMore(false);
  };
  
  const resetFilters = () => {
    setQuery('');
    setCounty('');
    setLandType('');
    setPriceRange([0, 50000000]);
    setAreaRange([0, 100]);
    setBadges([]);
  };

  const removeFilter = (type: string, value: any) => {
    if (type === 'query') setQuery('');
    if (type === 'county') setCounty('');
    if (type === 'landType') setLandType('');
    if (type === 'price') setPriceRange([0, 50000000]);
    if (type === 'area') setAreaRange([0, 100]);
    if (type === 'badge') setBadges(badges.filter(b => b !== value));
  }

  return (
    <div className="space-y-8">
      {/* Search Bar & Header */}
      <div className="flex flex-col gap-6" role="search" aria-label="Listing filters">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" aria-hidden="true" />
            <Input
              id="search-query"
              placeholder="Search properties, locations, or sellers..."
              value={query}
              onChange={(e) => {setQuery(e.target.value); updateUrlParams()}}
              className="pl-12 h-14 bg-background shadow-sm border-border/60 hover:border-border transition-all focus:ring-accent/20 text-lg"
              aria-label="Search listings by keyword"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={cn("h-14 px-6 gap-2 font-black uppercase text-[10px] tracking-widest transition-all", showAdvancedFilters && "bg-accent/5 border-accent text-accent")}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-content"
            >
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              <span>Refine Search</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px]" aria-label={`${activeFilters.length} filters applied`}>
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            <SaveSearchButton filters={currentFilters} disabled={activeFilters.length === 0} />
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleContent id="advanced-filters-content" className="space-y-6 p-6 rounded-xl border bg-card/50 backdrop-blur animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <Label htmlFor="county-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</Label>
                <Select value={county} onValueChange={(value) => { setCounty(value === 'all' ? '' : value); }}>
                  <SelectTrigger id="county-select" className="bg-background h-11">
                    <SelectValue placeholder="All Counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="land-type-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Land Category</Label>
                <Select value={landType} onValueChange={(value) => { setLandType(value === 'all' ? '' : value); }}>
                  <SelectTrigger id="land-type-select" className="bg-background h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {LAND_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label id="trust-level-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Trust Level</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-11 justify-between bg-background", badges.length > 0 && "border-accent text-accent")} aria-labelledby="trust-level-label">
                      <span className="truncate">{badges.length > 0 ? `${badges.length} Tiers Selected` : 'Any Trust Tier'}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="start">
                    <DropdownMenuLabel>Filter by Signal Confidence</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {BADGE_OPTIONS.map(badge => (
                      <DropdownMenuCheckboxItem
                        key={badge}
                        checked={badges.includes(badge)}
                        onCheckedChange={(checked) => {
                          const newBadges = checked ? [...badges, badge] : badges.filter(b => b !== badge);
                          setBadges(newBadges);
                        }}
                        className="py-2"
                      >
                        <div className="flex items-center gap-2">
                          <TrustBadge badge={badge} showTooltip={false} />
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <Label htmlFor="sort-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sorting</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger id="sort-select" className="bg-background h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newly Listed</SelectItem>
                    <SelectItem value="priceLow">Price: Low to High</SelectItem>
                    <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                    <SelectItem value="areaHigh">Size: Largest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label id="price-slider-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price (KES)</Label>
                  <span className="text-sm font-bold text-accent" aria-live="polite">{priceRange[0].toLocaleString()} — {priceRange[1].toLocaleString()}+</span>
                </div>
                <Slider
                  aria-labelledby="price-slider-label"
                  value={priceRange}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  max={50000000}
                  min={0}
                  step={500000}
                  className="py-4"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label id="area-slider-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Area (Acres)</Label>
                  <span className="text-sm font-bold text-accent" aria-live="polite">{areaRange[0]} — {areaRange[1]}+ acres</span>
                </div>
                <Slider
                  aria-labelledby="area-slider-label"
                  value={areaRange}
                  onValueChange={(value) => setAreaRange([value[0], value[1]])}
                  max={100}
                  min={0}
                  step={1}
                  className="py-4"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              <Button variant="ghost" size="sm" onClick={resetFilters}>Clear All</Button>
              <Button size="sm" className="bg-accent text-white h-11 px-8 font-bold uppercase text-[10px] tracking-widest" onClick={() => setShowAdvancedFilters(false)}>Apply</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-500 px-1" role="list" aria-label="Active filters">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Applied:</span>
          {activeFilters.map((filter, idx) => (
            <Badge key={idx} variant="secondary" role="listitem" className="pl-3 pr-1 py-1.5 gap-1.5 bg-accent/10 border-accent/20 text-accent hover:bg-accent/20 transition-colors">
              <span className="text-xs font-bold">{filter.label}</span>
              <button
                aria-label={`Remove ${filter.label} filter`}
                onClick={() => removeFilter(filter.type, filter.value)}
                className="rounded-full p-1 hover:bg-accent/20 transition-colors h-6 w-6 flex items-center justify-center"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
          <Button variant="link" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-accent font-bold uppercase tracking-widest h-9">
            Reset all
          </Button>
        </div>
      )}

      {/* Results Label */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground" aria-live="polite">
          <span className="text-foreground">{listingCountLabel}</span> Assets match your criteria
        </p>
      </div>

      {/* Listings Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedListings.length > 0 ? (
        <>
          <div id="listings-section" role="feed" aria-busy="false">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {sortedListings.map((listing, index) => (
              <Card 
                key={listing.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl"
              >
                <Link href={`/listings/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted" aria-label={`View details for ${listing.title} in ${listing.location}`}>
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0].url}
                      alt={`Property at ${listing.location} - ${listing.title}`}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      data-ai-hint={listing.images[0].hint}
                      priority={index < 4} // Performance Optimization: Prioritize loading the first 4 images
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LandPlot className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                  )}
                  
                  {/* Trust Badge - Prominent Overlay */}
                  <div className="absolute top-3 left-3 z-10 scale-110 md:scale-100 origin-top-left">
                    <TrustBadge badge={listing.badge} animated={true} />
                  </div>
                  
                  {/* Secondary Overlays */}
                  <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton listingId={listing.id} className="h-11 w-11 md:h-8 md:w-8 bg-white/90 shadow-sm" />
                  </div>
                  
                  <div className="absolute bottom-3 left-3 z-10">
                    <StatusBadge status={listing.status} className="bg-white/90 text-[9px] py-0.5 shadow-sm font-black" />
                  </div>
                </Link>

                <CardHeader className="p-5 pb-2">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 border-none px-0">
                      {listing.landType} — {listing.county}
                    </Badge>
                  </div>
                  <Link href={`/listings/${listing.id}`}>
                    <CardTitle className="text-base font-black leading-tight group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem]">
                      {listing.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs flex items-center gap-1.5 mt-1 font-bold">
                    <Search className="h-3 w-3 text-accent" aria-hidden="true" />
                    {listing.location}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4" role="group" aria-label="Property specifications">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-accent/10">
                        <LandPlot className="h-4 w-4 text-accent" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black">{listing.area}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Acres</span>
                      </div>
                    </div>
                    <div className="flex-1 h-8 border-l border-dashed border-border/60 mx-2" aria-hidden="true" />
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block mb-0.5">Asking Price</span>
                      <span className="text-lg font-black text-primary">KES {listing.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {listing.badge === 'TrustedSignal' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 font-black mb-4 animate-pulse uppercase tracking-tight" aria-label="This property is fully verified">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Fully Verified
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button asChild className="w-full h-12 md:h-11 bg-primary hover:bg-primary-mid text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all group/btn">
                    <Link href={`/listings/${listing.id}`} className="flex items-center justify-center gap-2">
                      View Details
                      <ChevronDown className="h-4 w-4 -rotate-90 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              ))}
            </StaggerContainer>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-12 pb-24 md:pb-8">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore} 
                variant="outline" 
                className="h-14 w-full md:w-auto md:px-12 gap-3 border-border bg-background shadow-sm hover:bg-accent/5 hover:text-accent font-black uppercase text-[10px] tracking-widest"
                aria-label="Load more property listings"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Transmitting...
                  </>
                ) : (
                  'Explore More Vaulted Assets'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="pb-24">
          <EmptyState
            icon={Search}
            title="We couldn't find a exact match"
            description="Try adjusting your filters or checking a different county. Verified land moves quickly on the platform."
            actions={[
              { label: 'Reset All Filters', variant: 'outline', onClick: resetFilters },
              { label: 'View All Properties', href: '/explore', variant: 'accent' },
            ]}
            className="py-20 bg-muted/10 border-muted/20"
          >
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card className="bg-background/50 border-none shadow-sm p-4 text-left">
                <h4 className="text-sm font-black uppercase flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                  Broaden Search
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Try removing one or two trust badge filters to see more verified options.
                </p>
              </Card>
              <Card className="bg-background/50 border-none shadow-sm p-4 text-left">
                <h4 className="text-sm font-black uppercase flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                  Flexibility
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Increasing your max budget by 10% often reveals significantly higher quality documentation.
                </p>
              </Card>
            </div>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
