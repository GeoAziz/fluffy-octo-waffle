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
import { PageWrapper, PageSection } from '@/components/page-wrapper';
import { LandingSection } from '@/components/landing-section';

/**
 * BuyerHomePage - Orchestrates the cinematic discovery journey.
 * Integrated with scroll-triggered reveals and premium layout wrappers.
 */
export function BuyerHomePage() {
  return (
    <div className="flex flex-col">
      <LandingHero />
      
      <LandingSection direction="up" delay={100}>
        <SocialProof />
      </LandingSection>

      <PageWrapper>
        <LandingSection direction="up" delay={200}>
          <PageSection className="py-20 md:py-28">
            <div className="mb-12 text-center md:text-left space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Explore Local Markets</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Compare verified listings with transparent documentation across the Republic of Kenya.</p>
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <ListingsContent />
            </Suspense>
          </PageSection>
        </LandingSection>

        <LandingSection direction="up">
          <PageSection className="py-16 border-t">
            <BadgeLegend />
          </PageSection>
        </LandingSection>
      </PageWrapper>

      <LandingSection direction="up">
        <FeatureShowcase />
      </LandingSection>

      <LandingSection direction="up">
        <ProductPreview />
      </LandingSection>

      <LandingSection direction="up">
        <TestimonialsSection />
      </LandingSection>
      
      <LandingSection direction="up">
        <FaqSection />
      </LandingSection>

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