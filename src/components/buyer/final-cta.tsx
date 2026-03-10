'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, LandPlot } from 'lucide-react';
import Link from 'next/link';

/**
 * FinalCta - Full-width cinematic gradient section to drive final conversion
 * Animated micro-interactions and high-impact typography.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-900 to-accent py-24 md:py-32 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)] opacity-50" />
      
      <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm animate-pulse">
            <LandPlot className="h-12 w-12 text-accent" />
          </div>
        </div>
        
        <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-6xl lg:text-7xl">
          Your Next Plot is <br/>
          <span className="text-accent">Waiting in the Vault</span>
        </h2>
        
        <p className="mx-auto mb-12 max-w-2xl text-lg text-emerald-50/80 md:text-xl">
          Join thousands of Kenyans using the platform to find land they can actually own. Browse verified listings or list your own land today.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button 
            size="lg" 
            asChild 
            className="h-14 w-full bg-white px-10 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-emerald-50 sm:w-auto shadow-2xl transition-all active:scale-[0.97]"
          >
            <Link href="/explore">
              Browse All Listings
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="ghost" 
            asChild 
            className="h-14 w-full border border-white/20 text-white hover:bg-white/10 sm:w-auto text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.97]"
          >
            <Link href="/signup">List Your Land</Link>
          </Button>
        </div>
        
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          No Middlemen • No Hidden Fees • Verified Documentation
        </p>
      </div>
    </section>
  );
}
