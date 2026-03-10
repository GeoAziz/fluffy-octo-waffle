'use client';

import { Badge } from '@/components/ui/badge';
import type { BadgeValue } from '@/lib/types';
import {
  Award,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type BadgeInfo = {
  variant: 'emerald' | 'muted-blue' | 'amber' | 'risk' | 'secondary';
  icon: React.ElementType;
  label: string;
  subtitle: string;
  description: string;
  requirements: string[];
};

const badgeMap: Record<BadgeValue, BadgeInfo> = {
  TrustedSignal: {
    variant: 'emerald',
    icon: ShieldCheck,
    label: 'Trusted Signal',
    subtitle: 'Highest Confidence',
    description: 'The premier trust tier. Every critical record has been vaulted and verified by our moderation team.',
    requirements: [
      'Original Title Deed verified',
      'Current Survey Map cross-checked',
      'Owner Identity confirmed (ID/PIN)',
      'Site photos matched to coordinates',
    ],
  },
  EvidenceReviewed: {
    variant: 'muted-blue',
    icon: FileCheck,
    label: 'Evidence Reviewed',
    subtitle: 'Verified Documents',
    description: 'Primary ownership documents have been provided and reviewed for basic validity.',
    requirements: [
      'Title Deed copy provided',
      'Basic Survey Map available',
      'Seller profile verified',
    ],
  },
  EvidenceSubmitted: {
    variant: 'amber',
    icon: Award,
    label: 'Evidence Submitted',
    subtitle: 'Verification Pending',
    description: 'The seller has vaulted their proof. Our trust team is currently performing triage.',
    requirements: [
      'Ownership documents uploaded',
      'Property spec check in progress',
    ],
  },
  Suspicious: {
    variant: 'risk',
    icon: ShieldAlert,
    label: 'Flagged Signal',
    subtitle: 'High Risk Alert',
    description: 'Our AI Trust Engine or a human moderator has detected inconsistencies in the vaulted documents.',
    requirements: [
      'Significant document mismatches',
      'Coordinates do not match survey',
      'Use extreme caution',
    ],
  },
  None: {
    variant: 'secondary',
    icon: HelpCircle,
    label: 'No Signal',
    subtitle: 'Awaiting Vault',
    description: 'This listing has no vaulted evidence yet. Buyers should request documents before proceeding.',
    requirements: [
      'Perform independent due diligence',
      'Verify all records manually',
    ],
  },
};

const badgeVariants = {
  emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20 shadow-glow shadow-emerald-500/5",
  "muted-blue": "bg-accent/10 text-accent border-accent/20 hover:bg-accent/15",
  amber: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/15",
  risk: "bg-risk/10 text-risk border-risk/20 hover:bg-risk/15 animate-shake",
  secondary: "bg-muted text-muted-foreground border-border",
};

const iconColors = {
  emerald: "text-emerald-600",
  "muted-blue": "text-accent",
  amber: "text-warning",
  risk: "text-risk",
  secondary: "text-muted-foreground",
};

export function TrustBadge({
  badge,
  className,
  showTooltip = true,
}: {
  badge: BadgeValue | null;
  className?: string;
  showTooltip?: boolean;
}) {
  if (!badge) return null;
  const info = badgeMap[badge] || badgeMap.None;
  const { variant, icon: Icon, label, subtitle, requirements, description } = info;

  const BadgeComponent = (
    <Badge
      className={cn(
        'transition-all duration-300 animate-soft-fade-scale whitespace-nowrap px-2.5 py-1 font-black uppercase text-[10px] tracking-widest',
        badgeVariants[variant],
        className
      )}
    >
      <Icon className={cn('mr-1.5 h-3.5 w-3.5', iconColors[variant])} aria-hidden="true" />
      {label}
    </Badge>
  );

  if (!showTooltip) {
    return BadgeComponent;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="inline-flex h-auto p-0 border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full cursor-help"
          aria-label={`Trust Level: ${label}. Click for details.`}
        >
          {BadgeComponent}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-border/40 animate-in fade-in zoom-in-95 duration-200" align="start">
        <div className={cn("p-5", variant === 'emerald' ? 'bg-emerald-500 text-white' : variant === 'risk' ? 'bg-risk text-white' : 'bg-secondary')}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-white/20 backdrop-blur-md">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight text-sm leading-tight">{label}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{subtitle}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-5 bg-background">
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {description}
          </p>

          <div className="space-y-3" role="group" aria-labelledby="verification-checklist-label">
            <p id="verification-checklist-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Audit:</p>
            <div className="space-y-2.5">
              {requirements.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[11px] font-bold text-foreground/80">
                  <div className="mt-0.5 rounded-full bg-primary/5 p-0.5">
                    <Check className="h-3 w-3 text-primary" strokeWidth={3} aria-hidden="true" />
                  </div>
                  <span className="leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground font-medium italic">
              * Verification based on vaulted records.
            </p>
            {variant === 'emerald' && <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}