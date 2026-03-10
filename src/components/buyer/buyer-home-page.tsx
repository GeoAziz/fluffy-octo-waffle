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
 * BuyerHomePage - Assembler for the Premium Public Funnel
 * Structured for high-trust storytelling and discovery.
 */
export function BuyerHomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero & Identity */}
      <LandingHero />
      <SocialProof />

      {/* 2. Discovery Layer - Primary search intent */}
      <section className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mb-12 text-center md:text-left space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Explore Local Markets</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">Compare verified listings with transparent documentation across the Republic of Kenya.</p>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <ListingsContent />
        </Suspense>
      </section>

      {/* 3. Trust Education - explaining the "Logic" */}
      <section className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t">
        <BadgeLegend />
      </section>

      {/* 4. Deep Feature Education - The "How" */}
      <FeatureShowcase />
      <ProductPreview />

      {/* 5. Social Proof & Community Safety */}
      <TestimonialsSection />
      
      {/* 6. Closing & Triage */}
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
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Property Registry...</p>
      </div>
    </div>
  );
}