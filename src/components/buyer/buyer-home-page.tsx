'use client';

import { Suspense } from 'react';
import { Loader2, ArrowRight, ShieldCheck, MapPin, Search } from 'lucide-react';
import { LandingHero } from '@/components/buyer/landing-hero';
import { SocialProof } from '@/components/buyer/social-proof';
import { FeatureShowcase } from '@/components/buyer/feature-showcase';
import { ProductPreview } from '@/components/buyer/product-preview';
import { BadgeLegend } from '@/components/buyer/badge-legend';
import { FaqSection } from '@/components/buyer/faq-section';
import { FinalCta } from '@/components/buyer/final-cta';
import { ListingsContent } from '@/components/buyer/listings-content';
import { TestimonialsSection } from '@/components/buyer/testimonials-section';
import { PageWrapper, PageSection, PageTitle } from '@/components/page-wrapper';
import { LandingSection } from '@/components/landing-section';
import { CallToAction } from '@/components/call-to-action';

/**
 * BuyerHomePage - Orchestrates the cinematic discovery journey.
 * Integrated with scroll-triggered reveals and premium layout wrappers.
 * Part of the Hypercraft Phase 3 implementation.
 */
export function BuyerHomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Protocol */}
      <LandingHero />
      
      {/* 2. Global Credibility Pulse */}
      <LandingSection direction="up" delay={100}>
        <SocialProof />
      </LandingSection>

      {/* 3. Primary Discovery Registry */}
      <PageWrapper>
        <LandingSection direction="up" delay={200}>
          <PageSection className="py-20 md:py-28">
            <div className="mb-12 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4">
                <MapPin className="h-3 w-3" />
                Live Registry Nodes
              </div>
              <PageTitle 
                title="Explore Local Markets" 
                description="Compare verified listings with transparent documentation across the Republic of Kenya."
              />
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <ListingsContent />
            </Suspense>
          </PageSection>
        </LandingSection>

        {/* 4. Trust Signal Legend */}
        <LandingSection direction="up">
          <PageSection className="py-16 border-t">
            <BadgeLegend />
          </PageSection>
        </LandingSection>
      </PageWrapper>

      {/* 5. Logic Capabilities Showcase */}
      <LandingSection direction="up">
        <FeatureShowcase />
      </LandingSection>

      {/* 6. Elite Interaction Preview */}
      <LandingSection direction="up">
        <ProductPreview />
      </LandingSection>

      {/* 7. Social Proof & Testimonials */}
      <LandingSection direction="up">
        <TestimonialsSection />
      </LandingSection>
      
      {/* 8. Conversion Refinement (CTA) */}
      <PageWrapper>
        <LandingSection direction="up">
          <CallToAction 
            pretitle="Ready to Secure Your Plot?"
            title="Join the Most Trusted Network"
            subtitle="Verified land moves quickly. Don't miss your chance."
            description="Our platform ensures every transaction is backed by verifiable documentation. Join thousands of successful buyers today."
            primaryAction={{
              label: "Browse All Listings",
              href: "/explore",
              icon: Search
            }}
            secondaryAction={{
              label: "List Your Land",
              href: "/signup",
              icon: ShieldCheck
            }}
            background="gradient"
          />
        </LandingSection>
      </PageWrapper>

      {/* 9. FAQ Protocol */}
      <LandingSection direction="up">
        <FaqSection />
      </LandingSection>

      {/* 10. Ultimate Terminal Exit (Final CTA) */}
      <FinalCta />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className="space-y-4 text-center">
        <div className="relative mx-auto h-12 w-12">
          <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Property Registry...</p>
      </div>
    </div>
  );
}