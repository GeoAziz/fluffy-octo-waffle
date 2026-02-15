'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrustBadge } from '@/components/trust-badge';
import { StatusBadge } from '@/components/status-badge';
import { FavoriteButton } from '@/components/favorite-button';
import Image from 'next/image';
import Link from 'next/link';
import { LandPlot, ArrowRight } from 'lucide-react';
import type { Listing } from '@/lib/types';

interface FeaturedListingsProps {
  listings: Listing[];
}

/**
 * FeaturedListings - Showcase top-quality properties with Gold badges
 * Highlights the most verified and documented properties on the platform
 */
export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) return null;

  return (
    <section className="py-12 border-b bg-muted/20">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Properties</h2>
          <p className="text-muted-foreground mt-2">
            Handpicked Gold-badge listings with the most complete documentation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 3).map((listing, index) => (
            <Card key={listing.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow animate-soft-fade-scale" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
              {/* Image Section */}
              <Link href={`/listings/${listing.id}`} className="block relative overflow-hidden bg-muted">
                <Image
                  src={listing.images[0]?.url || 'https://picsum.photos/seed/featured/600/400'}
                  alt={listing.title}
                  width={600}
                  height={400}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="aspect-[3/2] w-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <FavoriteButton listingId={listing.id} />
                </div>
                <div className="absolute top-3 right-3 flex gap-2 items-center">
                  {listing.badge && <TrustBadge badge={listing.badge} />}
                  <StatusBadge status={listing.status} />
                </div>
              </Link>

              {/* Content Section */}
              <CardHeader>
                <Link href={`/listings/${listing.id}`}>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {listing.title}
                  </CardTitle>
                </Link>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{listing.location}, {listing.county}</p>
                  <p className="text-sm text-foreground/80 flex items-center gap-1 mt-2">
                    <LandPlot className="h-4 w-4 text-accent" />
                    {listing.area} Acres
                  </p>
                </div>
                
                {/* Document Indicator */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Verified Documents:</p>
                  <div className="flex gap-1 flex-wrap">
                    <div className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Title Deed
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      Survey Map
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer with Price and Action */}
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-primary">
                    Ksh {listing.price.toLocaleString()}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/listings/${listing.id}`}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/#listings">
              View All Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
