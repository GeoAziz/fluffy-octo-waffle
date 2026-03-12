
'use client';

import { Suspense } from 'react';
import { Loader2, ArrowRight, ShieldCheck, MapPin, Search, Sparkles, BookOpen, Fingerprint, ChevronRight } from 'lucide-react';
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
import { useAuth } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function BuyerHomePage() {
  const { user, userProfile } = useAuth();
  
  // High-Trust logic: Prompt guidance if identity vault is empty
  const isFirstTimer = !user || (userProfile && userProfile.role === 'BUYER' && !userProfile.preferences);

  return (
    <div className="flex flex-col">
      <LandingHero />
      
      <LandingSection direction="up" delay={100}>
        <SocialProof />
      </LandingSection>

      {/* Primary Context Area: Dynamic Empty State vs Registry View */}
      <PageWrapper>
        <LandingSection direction="up">
          <PageSection id="listings-section" className="py-20 md:py-28" aria-label="Property Registry Node">
            <div className="mb-16 grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                  <MapPin className="h-3 w-3" />
                  Live Registry Nodes
                </div>
                <PageTitle 
                  title={isFirstTimer ? "Initialize Discovery" : "Global Registry Explorer"} 
                  description={isFirstTimer ? "Set your discovery preferences to begin receiving verified trust signals." : "Access the complete vault of verified Kenyan property records."}
                />
              </div>
              
              {isFirstTimer && (
                <Button asChild size="lg" className="h-14 px-8 font-black uppercase text-[11px] tracking-widest shadow-glow active:scale-95">
                  <Link href="/signup">
                    Provision My Search Node
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <Suspense fallback={<LoadingFallback />}>
              <ListingsContent />
            </Suspense>
          </PageSection>
        </LandingSection>

        {isFirstTimer && (
          <LandingSection direction="up">
            <PageSection className="py-12 border-t border-border/40">
              <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-mid to-emerald-900 p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={120} /></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[10px] font-black uppercase tracking-widest">
                      <BookOpen className="h-3 w-3" />
                      Registry Orientation
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Your First High-Trust Purchase</h2>
                    <p className="text-emerald-50/80 text-lg max-w-2xl font-medium leading-relaxed">
                      Traditional land buying in Kenya is high-risk. We've built an identity-first protocol to eliminate fraud and provide verifiable documentation for every plot.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <Link href="/trust" className="h-14 px-8 bg-white text-primary rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center shadow-lg hover:bg-emerald-50 transition-all active:scale-95">
                        Learn Badge Protocol
                      </Link>
                      <Link href="/signup" className="h-14 px-8 border border-white/30 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-white/10 transition-all active:scale-95">
                        Provision Identity Vault
                      </Link>
                    </div>
                  </div>
                  <div className="hidden xl:grid grid-cols-2 gap-6 w-[400px]">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 text-white shadow-xl">
                      <CardContent className="p-0 space-y-3">
                        <ShieldCheck className="h-8 w-8 text-emerald-400" />
                        <p className="text-sm font-black uppercase tracking-tight">Verified Proof</p>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">Every title deed is cross-checked by our trust team.</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6 text-white shadow-xl">
                      <CardContent className="p-0 space-y-3">
                        <Fingerprint className="h-8 w-8 text-accent" />
                        <p className="text-sm font-black uppercase tracking-tight">Secure Triage</p>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">Communicate only with verified identity owners.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </PageSection>
          </LandingSection>
        )}

        <LandingSection direction="up">
          <PageSection className="py-16 border-t border-border/40">
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

      <LandingSection direction="up">
        <FaqSection />
      </LandingSection>

      <FinalCta />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex w-full items-center justify-center py-20" role="status" aria-busy="true">
      <div className="space-y-4 text-center">
        <div className="relative mx-auto h-12 w-12">
          <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accessing Global Registry...</p>
      </div>
    </div>
  );
}
