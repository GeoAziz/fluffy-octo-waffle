'use client';

import { Button } from '@/components/ui/button';
import { BadgeCheck, ChevronDown, Shield, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * LandingHero - Premium Hero section for the landing page
 * Features gradient text, high-trust badges, and fluid entry animations.
 */
export function LandingHero() {
  const handleExplore = () => {
    const listingsSection = document.getElementById('listings-section');
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="relative w-full overflow-hidden border-b bg-primary text-white">
      {/* Background Image - Priority Loaded */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1646159755791-54e741749028?auto=format&fit=crop&q=80&w=2000"
          alt="Kenyan Landscape"
          fill
          priority
          className="object-cover opacity-30 transition-transform duration-[10s] hover:scale-110"
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-primary/95 to-emerald-900/80" />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Trust Signal */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
          <BadgeCheck className="h-4 w-4 text-accent" />
          <span>Kenya's #1 Verified Land Marketplace</span>
        </div>

        {/* Hero Headline */}
        <div className="max-w-4xl space-y-6">
          <h1 className="animate-fade-in-up text-4xl font-black tracking-tighter sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block">Find Land with</span>
            <span className="bg-gradient-to-r from-emerald-200 via-white to-accent bg-clip-text text-transparent">
              Ironclad Trust
            </span>
          </h1>
          <p className="animate-fade-in-up mx-auto max-w-2xl text-lg text-emerald-50/80 delay-150 sm:text-xl md:text-2xl">
            The only platform in Kenya that validates every title deed and survey map with AI-assisted administrative review.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="animate-fade-in-up mt-10 flex w-full flex-col items-center justify-center gap-4 delay-300 sm:flex-row">
          <Button 
            size="lg" 
            onClick={handleExplore} 
            className="h-14 w-full bg-white px-10 text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:bg-emerald-50 sm:w-auto shadow-glow"
          >
            Explore Vaulted Listings
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            asChild 
            className="h-14 w-full border-white/30 px-10 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 sm:w-auto"
          >
            <Link href="/trust">Our Verification Protocol</Link>
          </Button>
        </div>

        {/* Floating Scroll Indicator */}
        <button 
          onClick={handleExplore}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 p-2 text-white/50 transition-colors hover:text-white"
          aria-label="Scroll to listings"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
