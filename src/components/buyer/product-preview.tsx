'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Bot } from 'lucide-react';
import Image from 'next/image';

/**
 * ProductPreview - Bento grid showcasing the platform's core trust features
 * High-fidelity visual demo of the application's unique value props.
 */
export function ProductPreview() {
  return (
    <section className="py-24 bg-card border-y">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Built for Certainty</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">The platform provides a suite of tools designed to eliminate the risks of traditional land buying.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {/* Main Preview - Large Dashboard Demo */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden border-none shadow-xl bg-primary text-white">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-8 space-y-4">
                <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-widest">REAL-TIME MODERATION</Badge>
                <h3 className="text-3xl font-black uppercase tracking-tight">The Admin Command Center</h3>
                <p className="text-emerald-50/70 text-sm max-w-md">Our trust team uses a high-fidelity dashboard to review AI flags and document consistency before any listing goes live.</p>
              </div>
              <div className="flex-1 relative mt-auto mx-8 bg-background/10 rounded-t-2xl overflow-hidden border-x border-t border-white/10">
                <Image 
                  src="https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Admin Dashboard Preview" 
                  fill 
                  className="object-cover object-top opacity-80"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Feature - Visual OCR extraction */}
          <Card className="overflow-hidden border-none shadow-lg bg-accent text-white group">
            <CardContent className="p-6 space-y-4 h-full flex flex-col">
              <Bot className="h-8 w-8 transition-transform group-hover:scale-110" />
              <h4 className="font-black uppercase tracking-tight">AI OCR Extraction</h4>
              <p className="text-xs text-white/70 leading-relaxed">Automatically transcribes plot numbers and owner names from physical documents to detect potential alterations.</p>
            </CardContent>
          </Card>

          {/* Evidence Feature - Security visualization */}
          <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-card">
            <CardContent className="p-6 space-y-4 h-full flex flex-col justify-center items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-black uppercase tracking-tight text-primary">Immutable History</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Every modification is logged in our secure audit trail.</p>
            </CardContent>
          </Card>

          {/* Search Feature - Wide Bottom Discovery Pulse */}
          <Card className="md:col-span-3 overflow-hidden border-none shadow-lg bg-secondary">
            <CardContent className="p-0 h-full flex items-center">
              <div className="p-8 space-y-4 flex-1">
                <h4 className="text-2xl font-black uppercase tracking-tight text-primary">Filter by Signal Confidence</h4>
                <p className="text-sm text-muted-foreground">Search specifically for "Gold Verified" properties where full documentation is already available for review.</p>
              </div>
              <div className="hidden md:block w-1/3 h-full relative">
                <Image 
                  src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=800" 
                  alt="Search Interface" 
                  fill 
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
