'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, FileCheck, Award, ShieldAlert, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BadgeLegend - Explains the high-trust Signal system
 * Updated to match the Gold/Silver/Bronze product naming.
 */
export function BadgeLegend({
  distribution,
}: {
  distribution?: Partial<Record<'TrustedSignal' | 'EvidenceReviewed' | 'EvidenceSubmitted' | 'Suspicious', number>>;
}) {
  const total = (distribution?.TrustedSignal || 0) + (distribution?.EvidenceReviewed || 0) + (distribution?.EvidenceSubmitted || 0);
  const pct = (value: number) => (total > 0 ? `${Math.round((value / total) * 100)}% of listings` : 'Active verification');

  const badges = [
    {
      name: 'Gold Badge',
      id: 'TrustedSignal',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      tagline: 'Trusted Signal',
      percentage: pct(distribution?.TrustedSignal || 0),
      requirements: ['Title deed fully verified', 'Land survey confirmed', 'Seller ID & PIN checked', 'Site photos matched'],
      description: 'The premier trust tier. Every critical record has been vaulted and verified by our moderation team.',
    },
    {
      name: 'Silver Badge',
      id: 'EvidenceReviewed',
      icon: FileCheck,
      color: 'text-accent',
      bg: 'bg-accent-light',
      tagline: 'Evidence Reviewed',
      percentage: pct(distribution?.EvidenceReviewed || 0),
      requirements: ['Primary ownership docs provided', 'Basic survey plan uploaded', 'No obvious discrepancies'],
      description: 'Solid documentation provided. Key records have been checked for basic validity.',
    },
    {
      name: 'Bronze Badge',
      id: 'EvidenceSubmitted',
      icon: Award,
      color: 'text-warning',
      bg: 'bg-warning-light',
      tagline: 'Evidence Submitted',
      percentage: pct(distribution?.EvidenceSubmitted || 0),
      requirements: ['Ownership documents uploaded', 'Awaiting deep review', 'Basic listing details confirmed'],
      description: 'The entry trust level. Seller has provided proof which is currently in the queue for review.',
    },
  ];

  return (
    <Card className="border-none shadow-primary bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">Understanding Trust Signals</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              We quantify documentation quality so you can navigate the Kenyan land market with data, not guesswork.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit h-7 border-accent/20 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest px-3">
            Real-Time Verification
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className="group relative flex flex-col rounded-xl border border-border/40 bg-background/40 p-5 transition-all hover:shadow-md hover:border-accent/20">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("rounded-lg p-2.5 shadow-sm transition-transform group-hover:scale-110", badge.bg)}>
                    <Icon className={cn("h-6 w-6", badge.color)} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    {badge.percentage}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold mb-1 tracking-tight group-hover:text-accent transition-colors">
                  {badge.name}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{badge.tagline}</p>
                
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {badge.description}
                </p>
                
                <div className="space-y-2 mt-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 border-b border-border/40 pb-1">Verified Requirements</p>
                  <ul className="space-y-2">
                    {badge.requirements.map((requirement) => (
                      <li key={requirement} className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5">
                          <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-semibold text-foreground/80 leading-tight">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-6 p-4 rounded-xl bg-risk-light border border-risk/10">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-risk shadow-sm">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-risk uppercase tracking-wide">Suspicious Signal Identified</h4>
              <p className="text-xs text-risk/80 font-medium leading-relaxed max-w-2xl">
                Listings marked with this signal have significant documentation inconsistencies or have been flagged by the community. We strongly advise against any financial commitment without independent legal consultation.
              </p>
            </div>
          </div>
          <Badge className="bg-risk text-white border-none px-4 py-1.5 font-bold shadow-sm h-fit">
            High Risk Tier
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
