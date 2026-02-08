'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle2, Zap, ChevronDown } from 'lucide-react';
import Link from 'next/link';

/**
 * LandingHero - Hero section for the landing page
 * Introduces platform value proposition and calls to action
 */
export function LandingHero() {
  const handleExplore = () => {
    const listingsSection = document.getElementById('listings-section');
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="w-full">
      {/* Main Hero */}
      <div className="bg-gradient-to-b from-primary/5 via-transparent to-transparent py-12 sm:py-16 lg:py-20">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Find Verified Land
                <span className="block text-primary">You Can Trust</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Browse verified land listings in Kenya with transparent documentation and trust badges. 
                Make informed decisions with confidence.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                <p className="text-sm text-muted-foreground mt-1">Verified Listings</p>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl sm:text-3xl font-bold text-primary">99%</div>
                <p className="text-sm text-muted-foreground mt-1">Buyer Satisfaction</p>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground mt-1">Support Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              <Button size="lg" onClick={handleExplore} className="w-full sm:w-auto">
                Browse Properties
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/trust">Learn About Verification</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center pb-8">
          <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
        </div>
      </div>

      {/* Trust Features */}
      <div className="bg-muted/30 py-12 sm:py-16 border-y">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why Choose Kenya Land Trust?</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg">Verified Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Every listing includes verified documents: title deeds, survey maps, and supporting evidence.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg">Trust Badges</h3>
                  <p className="text-sm text-muted-foreground">
                    Gold, Silver, and Bronze badges show documentation quality at a glance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg">Fast & Easy</h3>
                  <p className="text-sm text-muted-foreground">
                    Search, filter, and connect with sellers directly. No middlemen, no hassle.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
