'use client';

import { useEffect, useState, useTransition, useMemo, useRef } from 'react';
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
import { Loader2, Search, SlidersHorizontal, X, LandPlot, ChevronDown, CheckCircle2, RotateCcw, ShieldCheck, MapPin } from 'lucide-react';
import { searchListingsAction } from '@/app/actions';
import type { Listing, BadgeValue } from '@/lib/types';
import { SaveSearchButton } from './save-search-button';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';

const LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Mixed-Use"];
const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kiambu', 'Kajiado', 'Machakos', 'Nakuru', 'Uasin Gishu', 'Kisumu',
  'Nyeri', 'Meru', 'Laikipia', 'Murang\'a', 'Kilifi', 'Kwale', 'Kakamega', 'Bungoma',
];
const BADGE_OPTIONS: BadgeValue[] = ["TrustedSignal", "EvidenceReviewed", "EvidenceSubmitted", "Suspicious"];

const badgeLabelMap: Record<BadgeValue, string> = {
  TrustedSignal: "Gold Verified",
  EvidenceReviewed: "Silver Verified",
  EvidenceSubmitted: "Bronze (Pending)",
  Suspicious: "Flagged Suspicious",
  None: "Awaiting Proof"
};

type SortOption = "newest" | "priceLow" | "priceHigh" | "areaHigh";

/**
 * Custom hook for swipe detection, now called at the component level.
 */
function useSwipeToSave(listingId: string, isFav: boolean, addFav: (id: string) => void) {
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isRightSwipe && !isFav) {
      addFav(listingId);
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

/**
 * Sub-component for individual listings to handle hooks correctly.
 */
function ListingRegistryCard({ listing, index }: { listing: Listing; index: number }) {
  const { addFavorite, isFavorite } = useFavorites();
  const swipeHandlers = useSwipeToSave(listing.id, isFavorite(listing.id), addFavorite);

  return (
    <Card 
      {...swipeHandlers}
      className={cn(
        "group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl relative",
        listing.badge === 'TrustedSignal' && "trust-glow-gold",
        listing.badge === 'EvidenceReviewed' && "trust-border-silver"
      )}
    >
      <Link href={`/listings/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted" aria-label={`View details for ${listing.title} in ${listing.location}`}>
        {listing.images && listing.images.length > 0 ? (
          <Image
            src={listing.images[0].url}
            alt={`Property Photo - ${listing.title}`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[2s] group-hover:scale-110"
            data-ai-hint={listing.images[0].hint}
            priority={index < 4}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LandPlot className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-10 scale-110 md:scale-100 origin-top-left">
          <TrustBadge badge={listing.badge} animated={true} />
        </div>
        
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <FavoriteButton listingId={listing.id} className="h-11 w-11 md:h-10 md:w-10 bg-white/95 shadow-xl border-none" />
        </div>
        
        <div className="absolute bottom-4 left-4 z-10">
          <StatusBadge status={listing.status} className="bg-white/95 text-[9px] py-1 px-3 shadow-md font-black border-none" />
        </div>
      </Link>

      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 border-none px-0">
            {listing.landType} • {listing.county}
          </Badge>
        </div>
        <Link href={`/listings/${listing.id}`}>
          <CardTitle className="text-lg font-black leading-[1.3] group-hover:text-accent transition-colors line-clamp-2 min-h-[3rem]">
            {listing.title}
          </CardTitle>
        </Link>
        <CardDescription className="text-xs flex items-center gap-2 mt-2 font-bold text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {listing.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-end">
        <div className="flex items-center gap-4 mb-6" role="group" aria-label="Property specifications">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/5 border border-accent/10">
              <LandPlot className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black">{listing.area}</span>
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Acres</span>
            </div>
          </div>
          <div className="flex-1 h-10 border-l border-dashed border-border/60 mx-2" aria-hidden="true" />
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground block mb-1 opacity-60">Handshake Value</span>
            <span className="text-xl font-black text-primary tracking-tighter">KES {listing.price.toLocaleString()}</span>
          </div>
        </div>
        
        {listing.badge === 'TrustedSignal' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 font-black mb-2 animate-soft-fade-scale uppercase tracking-wide" aria-label="This property is fully verified">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Elite Registry Protocol
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full h-12 bg-primary hover:bg-primary-mid text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 group/btn">
          <Link href={`/listings/${listing.id}`} className="flex items-center justify-center gap-2">
            Inspect Vault Record
            <ChevronDown className="h-4 w-4 -rotate-90 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * ListingsContent - Premier property discovery engine.
 * Optimized for high-trust filtering and mobile-first responsiveness.
 */
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
      {/* Dynamic Filter Terminal */}
      <div className="flex flex-col gap-6" role="search" aria-label="Registry filters">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" aria-hidden="true" />
            <Input
              id="search-query"
              placeholder="Search by neighborhood, seller, or plot number..."
              value={query}
              onChange={(e) => {setQuery(e.target.value); updateUrlParams()}}
              className="pl-12 h-14 bg-background shadow-inner border-border/60 hover:border-border transition-all focus:ring-accent/20 text-lg font-medium"
              aria-label="Search registry by keyword"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={cn(
                "h-14 px-6 gap-3 font-black uppercase text-[10px] tracking-widest transition-all", 
                showAdvancedFilters && "bg-accent/5 border-accent text-accent shadow-inner"
              )}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-content"
            >
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              <span>Refine Pulse</span>
              {activeFilters.length > 0 && (
                <Badge variant="accent" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center rounded-full text-[10px] shadow-sm">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            <SaveSearchButton filters={currentFilters} disabled={activeFilters.length === 0} />
          </div>
        </div>

        {/* Collapsible Refinement Panel */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleContent id="advanced-filters-content" className="space-y-8 p-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent/20" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <Label htmlFor="county-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Regional Target</Label>
                <Select value={county} onValueChange={(value) => { setCounty(value === 'all' ? '' : value); }}>
                  <SelectTrigger id="county-select" className="bg-background h-12 font-bold shadow-sm">
                    <SelectValue placeholder="All 47 Counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">Global Search</SelectItem>
                    {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="land-type-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Usage Profile</Label>
                <Select value={landType} onValueChange={(value) => { setLandType(value === 'all' ? '' : value); }}>
                  <SelectTrigger id="land-type-select" className="bg-background h-12 font-bold shadow-sm">
                    <SelectValue placeholder="All Usage Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">Any Usage</SelectItem>
                    {LAND_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label id="trust-level-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Documentation Shield</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-12 justify-between bg-background font-bold shadow-sm", badges.length > 0 && "border-accent text-accent")} aria-labelledby="trust-level-label">
                      <span className="truncate">{badges.length > 0 ? `${badges.length} Signals Selected` : 'Any Signal Level'}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 p-2 border-none shadow-2xl rounded-xl" align="start">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Triage by Signal Strength</DropdownMenuLabel>
                    <DropdownMenuSeparator className="mb-2" />
                    {BADGE_OPTIONS.map(badge => (
                      <DropdownMenuCheckboxItem
                        key={badge}
                        checked={badges.includes(badge)}
                        onCheckedChange={(checked) => {
                          const newBadges = checked ? [...badges, badge] : badges.filter(b => b !== badge);
                          setBadges(newBadges);
                        }}
                        className="py-3 px-3 rounded-lg focus:bg-accent/5"
                      >
                        <div className="flex items-center gap-2">
                          <TrustBadge badge={badge} showTooltip={false} className="h-5" />
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <Label htmlFor="sort-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Market Priority</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger id="sort-select" className="bg-background h-12 font-bold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest" className="font-bold">Newly Vaulted</SelectItem>
                    <SelectItem value="priceLow" className="font-bold">Value Options (Price ↑)</SelectItem>
                    <SelectItem value="priceHigh" className="font-bold">Premium Estates (Price ↓)</SelectItem>
                    <SelectItem value="areaHigh" className="font-bold">Scale (Area ↓)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="opacity-40" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label id="price-slider-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Budget Handshake (KES)</Label>
                  <span className="text-xs font-black text-accent bg-accent/5 px-2 py-1 rounded" aria-live="polite">
                    {priceRange[0].toLocaleString()} — {priceRange[1] >= 50000000 ? '50M+' : priceRange[1].toLocaleString()}
                  </span>
                </div>
                <Slider
                  aria-labelledby="price-slider-label"
                  value={priceRange}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  max={50000000}
                  min={0}
                  step={500000}
                  className="py-2"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label id="area-slider-label" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Acreage Protocol</Label>
                  <span className="text-xs font-black text-accent bg-accent/5 px-2 py-1 rounded" aria-live="polite">
                    {areaRange[0]} — {areaRange[1] >= 100 ? '100+' : areaRange[1]} Acres
                  </span>
                </div>
                <Slider
                  aria-labelledby="area-slider-label"
                  value={areaRange}
                  onValueChange={(value) => setAreaRange([value[0], value[1]])}
                  max={100}
                  min={0}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-6 gap-4 border-t border-border/40">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:text-risk">Clear Protocol</Button>
              <Button size="lg" className="h-12 px-12 bg-primary hover:bg-primary-mid text-white font-black uppercase text-[11px] tracking-widest shadow-glow active:scale-95" onClick={() => setShowAdvancedFilters(false)}>Initialize Registry Filter</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active High-Visibility Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 animate-in fade-in duration-500 px-1" role="list" aria-label="Active registry filters">
          <div className="flex items-center gap-2 mr-2">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Triage Status:</span>
          </div>
          {activeFilters.map((filter, idx) => (
            <Badge key={idx} variant="secondary" role="listitem" className="pl-3 pr-1 py-2 gap-2 bg-background border border-border/60 text-foreground hover:border-accent/40 transition-all shadow-sm">
              <span className="text-xs font-bold">{filter.label}</span>
              <button
                aria-label={`Remove ${filter.label} filter`}
                onClick={() => removeFilter(filter.type, filter.value)}
                className="rounded-full p-1 hover:bg-risk-light hover:text-risk transition-colors h-6 w-6 flex items-center justify-center bg-muted/30"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-risk hover:bg-risk-light">
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reset Protocol
          </Button>
        </div>
      )}

      {/* Results Signal */}
      <div className="flex items-center justify-between px-1 border-b border-border/40 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
          <span className="text-primary font-black text-xs">{listingCountLabel}</span> Vaulted assets match your handshake
        </p>
      </div>

      {/* Listings Registry Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedListings.length > 0 ? (
        <>
          <div id="listings-section" role="feed" aria-busy="false">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedListings.map((listing, index) => (
                <ListingRegistryCard 
                  key={listing.id}
                  listing={listing}
                  index={index}
                />
              ))}
            </StaggerContainer>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-16 pb-32">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore} 
                variant="outline" 
                className="h-16 w-full md:w-auto md:px-16 gap-4 border-border/60 bg-background shadow-xl hover:bg-accent hover:text-white hover:border-accent font-black uppercase text-xs tracking-widest transition-all active:scale-95"
                aria-label="Load more property listings"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                    Synchronizing Registry...
                  </>
                ) : (
                  'Explore More Vaulted Assets'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="pb-32">
          <EmptyState
            icon={Search}
            title="Registry Filter Failure"
            description="We couldn't find exact matches for your specific protocol. Verified land moves quickly on the platform."
            actions={[
              { label: 'Flush Filter Protocol', variant: 'outline', onClick: resetFilters, icon: RotateCcw },
              { label: 'View All Approved Assets', href: '/explore', variant: 'accent' },
            ]}
            className="py-24 bg-muted/10 border-muted/20 shadow-inner"
          >
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-background/50 border-none shadow-xl p-8 text-left group hover:bg-background transition-all duration-500 hover:-translate-y-1">
                <div className="mb-6 h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight mb-3">Broaden Range</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Try removing <strong>Trust Signal</strong> filters. Bronze and Silver listings often represent high-value opportunities currently in triage.
                </p>
              </Card>
              
              <Card className="bg-background/50 border-none shadow-xl p-8 text-left group hover:bg-background transition-all duration-500 hover:-translate-y-1">
                <div className="mb-6 h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-all shadow-sm">
                  <LandPlot className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight mb-3">Switch Counties</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Neighboring counties often have similar land quality at different price points. Explore outside your primary target node.
                </p>
              </Card>

              <Card className="bg-background/50 border-none shadow-xl p-8 text-left group hover:bg-background transition-all duration-500 hover:-translate-y-1">
                <div className="mb-6 h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight mb-3">Join Waitlist</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Save this search to receive an <strong>Identity Pulse</strong> (email) the moment a matching property is vaulted.
                </p>
              </Card>
            </div>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
