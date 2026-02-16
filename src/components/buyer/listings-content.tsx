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
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Loader2, Search, SlidersHorizontal, X, LandPlot, ChevronDown } from 'lucide-react';
import { searchListingsAction } from '@/app/actions';
import type { Listing, BadgeValue } from '@/lib/types';
import { SaveSearchButton } from './save-search-button';

const LAND_TYPES = ["Agricultural", "Residential", "Commercial", "Industrial", "Mixed-Use"];
const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kiambu', 'Kajiado', 'Machakos', 'Nakuru', 'Uasin Gishu', 'Kisumu',
  'Nyeri', 'Meru', 'Laikipia', 'Murang\'a', 'Kilifi', 'Kwale', 'Kakamega', 'Bungoma',
];
const BADGE_OPTIONS: BadgeValue[] = ["Gold", "Silver", "Bronze"];
const AMENITY_OPTIONS = [
  { value: 'water', label: 'Water access' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'road', label: 'Road access' },
  { value: 'perimeter', label: 'Perimeter wall' },
  { value: 'security', label: 'Security' },
];
const AMENITY_LABELS = Object.fromEntries(
  AMENITY_OPTIONS.map((option) => [option.value, option.label])
);
type SortOption = "newest" | "priceLow" | "priceHigh" | "areaHigh" | "areaLow" | "mostViewed" | "badgeRank";

/**
 * ListingsContent - Reusable component for browsing and filtering listings
 * Used by both home page and dedicated explore page
 */
export function ListingsContent() {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const isBrowsePage = pathname === '/listings' || pathname === '/explore';

  const [listings, setListings] = useState<Listing[]>([]);
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Filter states
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('');
  const [landType, setLandType] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 100]);
  const [badges, setBadges] = useState<BadgeValue[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeFilters = useMemo(() => {
    const filters = [];
    if (query) filters.push({type: 'query', value: query, label: `Query: ${query}`});
    if (county) filters.push({type: 'county', value: county, label: `County: ${county}`});
    if (landType) filters.push({type: 'landType', value: landType, label: `Type: ${landType}`});
    if (priceRange[0] > 0 || priceRange[1] < 50000000) filters.push({type: 'price', value: priceRange, label: `Price: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}`});
    if (areaRange[0] > 0 || areaRange[1] < 100) filters.push({type: 'area', value: areaRange, label: `Area: ${areaRange[0]} - ${areaRange[1]} acres`});
    badges.forEach(b => filters.push({type: 'badge', value: b, label: `${b} Badge`}));
    amenities.forEach((amenity) => {
      const label = AMENITY_OPTIONS.find((option) => option.value === amenity)?.label || amenity;
      filters.push({ type: 'amenity', value: amenity, label: `Amenity: ${label}` });
    });
    if (onlyVerified) filters.push({ type: 'onlyVerified', value: true, label: 'Only verified' });
    return filters;
  }, [query, county, landType, priceRange, areaRange, badges, amenities, onlyVerified]);
  
  const effectiveBadges = useMemo(() => {
    if (badges.length > 0) return badges;
    if (onlyVerified) return BADGE_OPTIONS;
    return undefined;
  }, [badges, onlyVerified]);

  const currentFilters = useMemo(() => ({
    query: query || undefined,
    county: county || undefined,
    landType: landType || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minArea: areaRange[0],
    maxArea: areaRange[1],
    badges: effectiveBadges,
    amenities: amenities.length > 0 ? amenities : undefined,
  }), [query, county, landType, priceRange, areaRange, effectiveBadges, amenities]);

  const listingCountLabel = loading ? 'Loading...' : `${listings.length}${hasMore ? '+' : ''}`;
  const resultsSummary = county ? `Showing ${listingCountLabel} properties in ${county}` : `Showing ${listingCountLabel} properties`;

  const sortedListings = useMemo(() => {
    const next = [...listings];
    if (sortBy === 'priceLow') return next.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHigh') return next.sort((a, b) => b.price - a.price);
    if (sortBy === 'areaHigh') return next.sort((a, b) => b.area - a.area);
    if (sortBy === 'areaLow') return next.sort((a, b) => a.area - b.area);
    if (sortBy === 'mostViewed') return next.sort((a, b) => (b.id.localeCompare(a.id)));
    if (sortBy === 'badgeRank') {
      const order: Record<BadgeValue | 'None', number> = { Gold: 3, Silver: 2, Bronze: 1, None: 0 };
      return next.sort((a, b) => (order[a.badge ?? 'None'] ?? 0) - (order[b.badge ?? 'None'] ?? 0)).reverse();
    }
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
    if (amenities.length > 0) params.set('amenities', amenities.join(',')); else params.delete('amenities');
    if (onlyVerified) params.set('onlyVerified', '1'); else params.delete('onlyVerified');
    
    startTransition(() => {
      // Using window.history.pushState to avoid scroll-to-top behavior of router.replace
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
    setAmenities(params.get('amenities')?.split(',').filter(Boolean) || []);
    setOnlyVerified(params.get('onlyVerified') === '1');
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      ...currentFilters,
      limit: 10,
    };
    
    searchListingsAction(params).then(result => {
      setListings(result.listings);
      setLastVisibleId(result.lastVisibleId);
      setHasMore(result.listings.length > 0 && !!result.lastVisibleId);
      setLoading(false);
      setIsFilterSheetOpen(false);
    });
  }, [currentFilters]);

  const handleLoadMore = async () => {
    if (!lastVisibleId || !hasMore) return;
    setLoadingMore(true);

    const params = {
      ...currentFilters,
      limit: 10,
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
    setAmenities([]);
    setOnlyVerified(false);
    // This will trigger the useEffect for search
  };

  const removeFilter = (type: string, value: any) => {
    if (type === 'query') setQuery('');
    if (type === 'county') setCounty('');
    if (type === 'landType') setLandType('');
    if (type === 'price') setPriceRange([0, 50000000]);
    if (type === 'area') setAreaRange([0, 100]);
    if (type === 'badge') setBadges(badges.filter(b => b !== value));
    if (type === 'amenity') setAmenities(amenities.filter((item) => item !== value));
    if (type === 'onlyVerified') setOnlyVerified(false);
    // This will trigger the useEffect for search
  }

  return (
    <div className="space-y-6">
      {isBrowsePage && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Verified listings marketplace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the filters to narrow by location, price, size, documentation level, and land type.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <div className="flex-1">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Properties</SheetTitle>
                <SheetDescription>Refine your search to find the perfect property</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile-search">Search by Keyword</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="mobile-search"
                      placeholder="e.g., Kajiado, farm..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        updateUrlParams();
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Land Type</Label>
                  <Select value={landType} onValueChange={(value) => { setLandType(value === 'all' ? '' : value); }}>
                    <SelectTrigger>
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
                  <Label>County</Label>
                  <Select value={county} onValueChange={(value) => { setCounty(value === 'all' ? '' : value); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counties</SelectItem>
                      {KENYA_COUNTIES.map((countyName) => (
                        <SelectItem key={countyName} value={countyName}>{countyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{priceRange[0].toLocaleString()}</span>
                    <span>{priceRange[1].toLocaleString()}+</span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                    max={50000000}
                    min={0}
                    step={100000}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area (Acres)</Label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{areaRange[0]}</span>
                    <span>{areaRange[1]}+</span>
                  </div>
                  <Slider
                    value={areaRange}
                    onValueChange={(value) => setAreaRange([value[0], value[1]])}
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trust Badge</Label>
                  <div className="space-y-2">
                    {BADGE_OPTIONS.map(badge => (
                      <div key={badge} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`badge-${badge}`}
                          checked={badges.includes(badge)}
                          onChange={(e) => {
                            const newBadges = e.target.checked ? [...badges, badge] : badges.filter(b => b !== badge);
                            setBadges(newBadges);
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`badge-${badge}`} className="ml-2 text-sm cursor-pointer">{badge}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Only verified</p>
                    <p className="text-xs text-muted-foreground">Gold, Silver, or Bronze</p>
                  </div>
                  <Switch checked={onlyVerified} onCheckedChange={setOnlyVerified} />
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    {AMENITY_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={amenities.includes(option.value)}
                          onChange={(event) => {
                            const next = event.target.checked
                              ? [...amenities, option.value]
                              : amenities.filter((item) => item !== option.value);
                            setAmenities(next);
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-0 -mx-2 border-t bg-background px-2 py-4">
                  <div className="flex gap-2">
                    {activeFilters.length > 0 && (
                      <Button variant="outline" className="flex-1" onClick={resetFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Button className="flex-1" onClick={() => setIsFilterSheetOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-listings-mobile" className="text-sm">Sort</Label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger id="sort-listings-mobile" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="priceLow">Price: Low to High</SelectItem>
              <SelectItem value="priceHigh">Price: High to Low</SelectItem>
              <SelectItem value="areaLow">Size: Small to Large</SelectItem>
              <SelectItem value="areaHigh">Size: Large to Small</SelectItem>
              <SelectItem value="mostViewed">Most viewed</SelectItem>
              <SelectItem value="badgeRank">Badge ranking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6 rounded-lg border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search by Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-query"
                  placeholder="e.g., Kajiado, Kitengela, farm..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    updateUrlParams();
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select value={county} onValueChange={(value) => { setCounty(value === 'all' ? '' : value); }}>
                <SelectTrigger id="county">
                  <SelectValue placeholder="All counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {KENYA_COUNTIES.map((countyName) => (
                    <SelectItem key={countyName} value={countyName}>{countyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="land-type">Land Type</Label>
              <Select value={landType} onValueChange={(value) => { setLandType(value === 'all' ? '' : value); }}>
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
              <Label>Trust Badge</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{badges.length > 0 ? `${badges.length} selected` : 'Any Badge'}</span>
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Badge</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {BADGE_OPTIONS.map(badge => (
                    <DropdownMenuCheckboxItem
                      key={badge}
                      checked={badges.includes(badge)}
                      onCheckedChange={(checked) => {
                        const newBadges = checked ? [...badges, badge] : badges.filter(b => b !== badge);
                        setBadges(newBadges);
                      }}
                    >
                      {badge}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Only verified</p>
                <p className="text-xs text-muted-foreground">Gold, Silver, or Bronze</p>
              </div>
              <Switch checked={onlyVerified} onCheckedChange={setOnlyVerified} />
            </div>

            <div className="space-y-2">
              <Label>Price Range (Ksh)</Label>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{priceRange[0].toLocaleString()}</span>
                <span>{priceRange[1].toLocaleString()}{priceRange[1] === 50000000 ? '+' : ''}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange([value[0], value[1]])}
                max={50000000}
                min={0}
                step={100000}
              />
            </div>

            <div className="space-y-2">
              <Label>Area (Acres)</Label>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{areaRange[0]}</span>
                <span>{areaRange[1]}{areaRange[1] === 100 ? '+' : ''}</span>
              </div>
              <Slider
                value={areaRange}
                onValueChange={(value) => setAreaRange([value[0], value[1]])}
                max={100}
                min={0}
                step={1}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setShowAdvancedFilters((prev) => !prev)} className="justify-between">
                Advanced filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <CollapsibleContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <div className="grid gap-2 text-xs text-muted-foreground">
                      {AMENITY_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={amenities.includes(option.value)}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...amenities, option.value]
                                : amenities.filter((item) => item !== option.value);
                              setAmenities(next);
                            }}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {activeFilters.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">Active Filters:</p>
                  {activeFilters.map((filter, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      {filter.label}
                      <button
                        aria-label={`Remove ${filter.label} filter`}
                        onClick={() => removeFilter(filter.type, filter.value)}
                        className="ml-1 hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={resetFilters}>Clear all</Button>
                </div>
              </div>
            )}
            <div className="ml-auto">
              <SaveSearchButton filters={currentFilters} disabled={activeFilters.length === 0} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card p-3">
            <p className="text-sm text-muted-foreground">{resultsSummary}</p>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 rounded-full border p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Label htmlFor="sort-listings" className="text-sm whitespace-nowrap">Sort by</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger id="sort-listings" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="priceLow">Price: Low to High</SelectItem>
                    <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                    <SelectItem value="areaLow">Size: Small to Large</SelectItem>
                    <SelectItem value="areaHigh">Size: Large to Small</SelectItem>
                    <SelectItem value="mostViewed">Most viewed</SelectItem>
                    <SelectItem value="badgeRank">Badge ranking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedListings.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="listings-section">
                  {sortedListings.map((listing) => (
                    <Card key={listing.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                      <Link href={`/listings/${listing.id}`} className="block relative">
                        <div className="relative h-48 overflow-hidden bg-muted">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0].url}
                              alt={listing.images[0].hint || listing.title}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <LandPlot className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <FavoriteButton listingId={listing.id} />
                        </div>
                        {listing.badge && <TrustBadge badge={listing.badge} className="absolute top-2 left-2 z-10" />}
                      </Link>

                      <CardHeader className="flex-1">
                        <Link href={`/listings/${listing.id}`}>
                          <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">{listing.title}</CardTitle>
                        </Link>
                        <CardDescription className="line-clamp-2">{listing.location}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Price</span>
                            <span className="font-semibold">Ksh {listing.price.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Area</span>
                            <span className="font-semibold">{listing.area} acres</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Type</span>
                            <span className="font-semibold text-xs">{listing.landType}</span>
                          </div>
                        </div>

                        {listing.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                        )}

                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {listing.amenities.slice(0, 3).map((amenity) => (
                              <span key={amenity} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                                {AMENITY_LABELS[amenity] ?? amenity}
                              </span>
                            ))}
                            {listing.amenities.length > 3 && (
                              <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                                +{listing.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link href={`/listings/${listing.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" id="listings-section">
                  {sortedListings.map((listing) => (
                    <Card key={listing.id} className="flex flex-col md:flex-row overflow-hidden">
                      <Link href={`/listings/${listing.id}`} className="relative md:w-64">
                        <div className="relative h-48 md:h-full overflow-hidden bg-muted">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0].url}
                              alt={listing.images[0].hint || listing.title}
                              fill
                              sizes="(min-width: 1024px) 256px, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <LandPlot className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <FavoriteButton listingId={listing.id} />
                        </div>
                        {listing.badge && <TrustBadge badge={listing.badge} className="absolute top-2 left-2 z-10" />}
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <CardHeader>
                          <Link href={`/listings/${listing.id}`}>
                            <CardTitle className="line-clamp-2 transition-colors hover:text-primary">{listing.title}</CardTitle>
                          </Link>
                          <CardDescription>{listing.location}, {listing.county}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-xs text-muted-foreground">Price</span>
                              <p className="font-semibold">Ksh {listing.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Area</span>
                              <p className="font-semibold">{listing.area} acres</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Type</span>
                              <p className="font-semibold">{listing.landType}</p>
                            </div>
                          </div>
                          {listing.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                          )}

                          {listing.amenities && listing.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {listing.amenities.slice(0, 4).map((amenity) => (
                                <span key={amenity} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                                  {AMENITY_LABELS[amenity] ?? amenity}
                                </span>
                              ))}
                              {listing.amenities.length > 4 && (
                                <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                                  +{listing.amenities.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="mt-auto">
                          <Button asChild>
                            <Link href={`/listings/${listing.id}`}>View Details</Link>
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center py-8">
                  <Button onClick={handleLoadMore} disabled={loadingMore} className="gap-2">
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Properties'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No listings found"
              description="Try adjusting your filters or search terms to explore more options."
              actions={[
                { label: 'Clear filters', variant: 'outline', onClick: resetFilters },
                { label: 'Get help', href: '/contact' },
              ]}
            >
              <div className="mx-auto max-w-xl rounded-md bg-muted/60 px-4 py-3 text-left">
                <p className="mb-2 font-medium text-foreground">Try these quick adjustments:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Increase the max price by 10-20%.</li>
                  <li>Widen area range by at least 5 acres.</li>
                  <li>Remove one trust badge filter.</li>
                </ul>
              </div>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
