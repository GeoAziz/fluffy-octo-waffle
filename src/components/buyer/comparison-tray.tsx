'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Share2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Listing } from '@/lib/types';

interface ComparisonTrayProps {
  listings: Listing[];
  onRemove: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onCompare: () => void;
}

/**
 * ComparisonTray - Fixed bottom-right component for side-by-side listing comparison
 * Allows buyers to compare up to 4 properties with key details highlighted
 */
export function ComparisonTray({
  listings,
  onRemove,
  onClear,
  isOpen,
  onCompare,
}: ComparisonTrayProps) {
  const maxListings = 4;
  const canAddMore = listings.length < maxListings;

  if (!isOpen || listings.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="shadow-2xl bg-card/95 backdrop-blur-sm border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tight">
                Comparison Tray
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {listings.length} of {maxListings} properties selected
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0"
              aria-label="Close comparison tray"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Listing Preview Chips */}
          <div className="flex gap-2 flex-wrap">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="relative group h-16 w-20 rounded-lg overflow-hidden border border-border/50 hover:border-accent/50 transition-colors"
              >
                {listing.images?.[0] ? (
                  <Image
                    src={listing.images[0].url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold">
                    {listing.title.slice(0, 2)}
                  </div>
                )}
                <button
                  onClick={() => onRemove(listing.id)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/50 p-1 hover:bg-black/70"
                  aria-label={`Remove ${listing.title} from comparison`}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Summary */}
          <div className="space-y-2 text-xs bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between font-medium">
              <span>Price Range</span>
              <span className="text-accent font-black">
                {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                }).format(Math.min(...listings.map(l => l.price)))}
                {' - '}
                {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                }).format(Math.max(...listings.map(l => l.price)))}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Size Range</span>
              <span className="text-accent font-black">
                {Math.min(...listings.map(l => l.area || 0)).toLocaleString()}m² - {Math.max(...listings.map(l => l.area || 0)).toLocaleString()}m²
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Badge Quality</span>
              <div className="flex gap-1">
                {['TrustedSignal', 'EvidenceReviewed', 'EvidenceSubmitted'].map(badge => (
                  <Badge
                    key={badge}
                    variant="secondary"
                    className="text-[9px] font-black"
                  >
                    {listings.filter(l => l.badge === badge).length > 0 && '✓'}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onCompare}
              className="flex-1 h-9 text-xs font-black uppercase tracking-widest"
            >
              Compare All
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2 text-xs font-black"
              aria-label="Export comparison"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>

          {/* Helper Text */}
          {canAddMore && (
            <p className="text-[9px] text-muted-foreground text-center font-medium uppercase tracking-widest">
              Add up to {maxListings - listings.length} more properties to compare
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
