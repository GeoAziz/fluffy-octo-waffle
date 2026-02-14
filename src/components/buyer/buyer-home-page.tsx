'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LandingHero } from '@/components/buyer/landing-hero';
import { BadgeLegend } from '@/components/buyer/badge-legend';
import { HowToFind } from '@/components/buyer/how-to-find';
import { ListingsContent } from '@/components/buyer/listings-content';
import { TestimonialsSection } from '@/components/buyer/testimonials-section';

export function BuyerHomePage() {
  return (
    <>
      <LandingHero />
      <HowToFind />

      <section className="container max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <BadgeLegend />
      </section>

      <Suspense fallback={<LoadingFallback />}>
        <ListingsContent />
      </Suspense>

      <TestimonialsSection />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    </div>
  );
}
