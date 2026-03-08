'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LandingHero } from '@/components/buyer/landing-hero';
import { SocialProof } from '@/components/buyer/social-proof';
import { FeatureShowcase } from '@/components/buyer/feature-showcase';
import { ProductPreview } from '@/components/buyer/product-preview';
import { BadgeLegend } from '@/components/buyer/badge-legend';
import { FaqSection } from '@/components/buyer/faq-section';
import { FinalCta } from '@/components/buyer/final-cta';
import { ListingsContent } from '@/components/buyer/listings-content';
import { TestimonialsSection } from '@/components/buyer/testimonials-section';

/**
 * BuyerHomePage - Complete Landing Experience
 * Structured for trust, discovery, and conversion.
 */
export function BuyerHomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero & Identity */}
      <LandingHero />
      <SocialProof />

      {/* Discovery Layer */}
      <section className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Explore Local Markets</h2>
          <p className="mt-4 text-muted-foreground text-lg">Compare verified listings with transparent documentation across Kenya.</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <ListingsContent />
        </Suspense>
      </section>

      {/* Trust Education */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <BadgeLegend />
      </section>

      {/* Deep Feature Education */}
      <FeatureShowcase />
      <ProductPreview />

      {/* Social Proof & Conversion */}
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Registry...</p>
      </div>
    </div>
  );
}
