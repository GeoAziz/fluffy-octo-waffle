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
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_24px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all duration-300",
  "muted-blue": "bg-accent/10 text-accent dark:text-accent border-accent/30 dark:border-accent/40 hover:bg-accent/15 dark:hover:bg-accent/20 shadow-[0_0_12px_rgba(47,111,149,0.1)] dark:shadow-[0_0_12px_rgba(47,111,149,0.2)] hover:shadow-[0_0_24px_rgba(47,111,149,0.15)] dark:hover:shadow-[0_0_24px_rgba(47,111,149,0.3)] transition-all duration-300",
  amber: "bg-warning/10 text-warning dark:text-warning border-warning/30 dark:border-warning/40 hover:bg-warning/15 dark:hover:bg-warning/20 shadow-[0_0_12px_rgba(197,139,46,0.1)] dark:shadow-[0_0_12px_rgba(197,139,46,0.2)] transition-all duration-300",
  risk: "bg-risk/15 text-risk dark:text-red-400 border-risk/40 dark:border-risk/50 hover:bg-risk/20 dark:hover:bg-risk/25 shadow-[0_0_16px_rgba(140,47,57,0.2)] dark:shadow-[0_0_16px_rgba(140,47,57,0.4)] hover:shadow-[0_0_32px_rgba(140,47,57,0.3)] dark:hover:shadow-[0_0_32px_rgba(140,47,57,0.5)] animate-badge-glow transition-all duration-300",
  secondary: "bg-muted text-muted-foreground border-border hover:bg-muted/80 transition-all duration-300",
};

const iconColors = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  "muted-blue": "text-accent dark:text-accent",
  amber: "text-warning dark:text-warning",
  risk: "text-risk dark:text-red-400",
  secondary: "text-muted-foreground",
};

export function TrustBadge({
  badge,
  className,
  showTooltip = true,
  animated = true,
}: {
  badge: BadgeValue | null;
  className?: string;
  showTooltip?: boolean;
  animated?: boolean;
}) {
  if (!badge) return null;
  const info = badgeMap[badge] || badgeMap.None;
  const { variant, icon: Icon, label, subtitle, requirements, description } = info;

  const BadgeComponent = (
    <Badge
      className={cn(
        'px-3 py-1.5 font-bold uppercase text-xs tracking-wide rounded-full border transition-all duration-300',
        animated && 'animate-scale-in',
        badgeVariants[variant],
        className
      )}
    >
      <Icon className={cn('mr-1.5 h-4 w-4 flex-shrink-0', iconColors[variant])} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </Badge>
  );

  if (!showTooltip) {
    return BadgeComponent;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="inline-flex h-auto p-1 border-none bg-transparent outline-none rounded-full cursor-help focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 hover:scale-105"
          aria-label={`Trust Level: ${label}. Click for details.`}
        >
          {BadgeComponent}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          'w-80 p-0 overflow-hidden rounded-xl border border-border/60 shadow-xl',
          'animate-scale-in duration-200'
        )} 
        align="start"
      >
        {/* Header with variant-specific background */}
        <div className={cn(
          "p-5 bg-gradient-to-br",
          variant === 'emerald' && 'from-emerald-500 to-emerald-600 text-white',
          variant === 'muted-blue' && 'from-accent to-blue-700 text-white',
          variant === 'amber' && 'from-warning to-amber-700 text-white',
          variant === 'risk' && 'from-risk to-red-700 text-white shadow-lg shadow-risk/20',
          variant === 'secondary' && 'from-secondary to-gray-400 text-foreground'
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-lg p-2.5 backdrop-blur-md transition-transform duration-200",
              variant === 'emerald' && 'bg-white/20',
              variant === 'muted-blue' && 'bg-white/20',
              variant === 'amber' && 'bg-white/20',
              variant === 'risk' && 'bg-white/15',
              variant === 'secondary' && 'bg-black/10'
            )}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-tight text-sm leading-tight">{label}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Content with dark mode support */}
        <div className="p-5 space-y-5 bg-background dark:bg-slate-950 border-t border-border/40">
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {description}
          </p>

          <div className="space-y-3" role="group" aria-labelledby="verification-checklist-label">
            <p id="verification-checklist-label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Audit:</p>
            <div className="space-y-2.5">
              {requirements.map((item, idx) => (
                <div 
                  key={item} 
                  className="flex items-start gap-2.5 text-sm font-medium text-foreground/90 transition-all duration-200 hover:text-foreground"
                  style={{
                    animation: `slide-up 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${idx * 50}ms`,
                    opacity: 0
                  }}
                >
                  <div className={cn(
                    "mt-0.5 rounded-full p-1 flex-shrink-0 transition-all duration-200",
                    variant === 'emerald' && 'bg-emerald-500/10',
                    variant === 'muted-blue' && 'bg-accent/10',
                    variant === 'amber' && 'bg-warning/10',
                    variant === 'risk' && 'bg-risk/10',
                    variant === 'secondary' && 'bg-muted'
                  )}>
                    <Check className={cn(
                      "h-4 w-4 stroke-[2.5]",
                      iconColors[variant]
                    )} aria-hidden="true" />
                  </div>
                  <span className="leading-tight pt-0.5">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium italic">
              * Verification based on vaulted records.
            </p>
            {variant === 'emerald' && (
              <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse dark:text-emerald-400" />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}