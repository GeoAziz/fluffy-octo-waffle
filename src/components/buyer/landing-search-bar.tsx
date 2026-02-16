'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

const LAND_TYPES = ['Residential', 'Commercial', 'Agricultural', 'Mixed'];
const KENYA_COUNTIES = [
  'Nairobi',
  'Kiambu',
  'Machakos',
  'Kajiado',
  'Nakuru',
  'Mombasa',
  'Uasin Gishu',
  'Kisumu',
];
const BADGES = ['Gold', 'Silver', 'Bronze'];

export function LandingSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('');
  const [landType, setLandType] = useState('');
  const [badge, setBadge] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 50000000]);
  const [sizeRange, setSizeRange] = useState<[number, number]>([0.25, 50]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (query) params.set('query', query);
    if (county) params.set('county', county);
    if (landType) params.set('landType', landType);
    if (badge) params.set('badges', badge);
    params.set('minPrice', String(Math.round(priceRange[0])));
    params.set('maxPrice', String(Math.round(priceRange[1])));
    params.set('minArea', String(sizeRange[0]));
    params.set('maxArea', String(sizeRange[1]));

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Search &amp; Filter Listings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Set your location, budget, and documentation level to surface the best matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="landing-query">Location or keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="landing-query"
                placeholder="Nairobi, Ruaka, title deed..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>County</Label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger>
                <SelectValue placeholder="All counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All counties</SelectItem>
                {KENYA_COUNTIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property type</Label>
            <Select value={landType} onValueChange={setLandType}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {LAND_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Documentation level</Label>
            <Select value={badge} onValueChange={setBadge}>
              <SelectTrigger>
                <SelectValue placeholder="All badges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All badges</SelectItem>
                {BADGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Price range (KES)</Label>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{priceRange[0].toLocaleString()}</span>
              <span>{priceRange[1].toLocaleString()}+</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange([value[0], value[1]])}
              min={500000}
              max={50000000}
              step={100000}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label>Size range (acres)</Label>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{sizeRange[0]} acres</span>
              <span>{sizeRange[1]}+ acres</span>
            </div>
            <Slider
              value={sizeRange}
              onValueChange={(value) => setSizeRange([value[0], value[1]])}
              min={0.25}
              max={100}
              step={0.25}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Browse Verified Listings
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
