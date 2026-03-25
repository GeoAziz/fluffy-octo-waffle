'use client';

import { ShieldCheck, Bot, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Evidence-First Listings',
    description: 'No more "ghost" properties. Every seller is required to upload verifiable documentation (Title Deeds, Survey Maps) which our team reviews for authenticity.',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=800',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'AI Trust Pulse',
    description: 'Our proprietary Trust Engine uses advanced OCR and pattern detection to flag inconsistencies in land documents, protecting you from sophisticated fraud.',
    icon: Bot,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    color: 'text-accent',
    bg: 'bg-accent-light',
  },
  {
    title: 'Secure Seller Vaults',
    description: 'Documents are stored in encrypted vaults and only shared with verified buyers. We provide a secure environment for high-stakes transactions.',
    icon: Lock,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-20 max-w-3xl">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-primary md:text-5xl">
            Redefining Transparency in Real Estate
          </h2>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            We&apos;ve built the technical infrastructure to solve Kenya&apos;s biggest land problems: missing records and fraudulent claims.
          </p>
        </div>

        <div className="space-y-24 md:space-y-40">
          {features.map((feature, i) => (
            <div 
              key={feature.title} 
              className={cn(
                "flex flex-col gap-12 md:flex-row md:items-center",
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              )}
            >
              <div className="flex-1 space-y-6">
                <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm", feature.bg)}>
                  <feature.icon className={cn("h-6 w-6", feature.color)} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight md:text-4xl">{feature.title}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <div className="pt-4">
                  <Link href="/trust" className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary hover:text-accent focus-visible:ring-2 focus-visible:ring-accent rounded-md p-1">
                    See our methodology
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              
              <div className="relative flex-1">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border-8 border-white shadow-2xl dark:border-border/40">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-2xl bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
