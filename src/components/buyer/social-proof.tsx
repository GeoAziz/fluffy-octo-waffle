'use client';

import { ShieldCheck, Users, Globe, Coins } from 'lucide-react';

/**
 * SocialProof - Displays platform metrics to build immediate credibility
 * Featuring staggered entry animations.
 */
export function SocialProof() {
  const stats = [
    { label: 'Verified Transactions', value: 'KES 12B+', icon: Coins },
    { label: 'Active Land Buyers', value: '15,000+', icon: Users },
    { label: 'Verified Properties', value: '2,400+', icon: ShieldCheck },
    { label: 'Counties Covered', value: '24', icon: Globe },
  ];

  return (
    <section className="border-b bg-card py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-3 rounded-full bg-primary/5 p-2 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-black tracking-tight text-foreground md:text-2xl">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}