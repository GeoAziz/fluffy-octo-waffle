import type { Listing } from '@/lib/types';
import { LandingHero } from '@/components/buyer/landing-hero';
import { BadgeLegend } from '@/components/buyer/badge-legend';
import { LandingSearchBar } from '@/components/buyer/landing-search-bar';
import { FeaturedListings } from '@/components/buyer/featured-listings';
import { HowToFind } from '@/components/buyer/how-to-find';
import { TestimonialsSection } from '@/components/buyer/testimonials-section';
import { CtaSection } from '@/components/buyer/cta-section';

export function BuyerHomePage({ featuredListings }: { featuredListings: Listing[] }) {
  return (
    <>
      <LandingHero />

      <section className="container max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <BadgeLegend />
      </section>

      <section className="container max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <LandingSearchBar />
      </section>

      <FeaturedListings listings={featuredListings} />

      <HowToFind />

      <TestimonialsSection />

      <CtaSection />
    </>
  );
}
