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
    description: 'All essential legal documents are verified and consistent.',
    requirements: [
      'Original Title Deed verified',
      'Recent Land Survey matching boundaries',
      'Rate Clearance Certificate up to date',
      'Seller Identity & PIN verified',
      'Physical site photos confirmed',
    ],
  },
  EvidenceReviewed: {
    variant: 'muted-blue',
    icon: FileCheck,
    label: 'Evidence Reviewed',
    subtitle: 'Verified Documents',
    description: 'Documentation has been reviewed and found to be in order.',
    requirements: [
      'Title Deed copy provided',
      'Survey Map available',
      'Seller ID documentation confirmed',
      'Multiple property views available',
    ],
  },
  EvidenceSubmitted: {
    variant: 'amber',
    icon: Award,
    label: 'Evidence Submitted',
    subtitle: 'Verification Pending',
    description: 'Seller has provided documents that are currently under review.',
    requirements: [
      'At least one ownership document provided',
      'Basic property details submitted',
      'Awaiting detailed admin review',
    ],
  },
  Suspicious: {
    variant: 'risk',
    icon: ShieldAlert,
    label: 'Flagged Signal',
    subtitle: 'Use Extreme Caution',
    description: 'Inconsistencies detected in documentation or images.',
    requirements: [
      'Missing critical legal proof',
      'Conflicting document details',
      'Reported by multiple users',
    ],
  },
  None: {
    variant: 'secondary',
    icon: HelpCircle,
    label: 'Not Badged',
    subtitle: 'Awaiting Documents',
    description: 'No documentation has been submitted for review yet.',
    requirements: [
      'Buyer must request documents directly',
      'Perform full manual due diligence',
    ],
  },
};

const badgeVariants = {
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 shadow-sm",
  "muted-blue": "bg-accent-light text-accent border-accent/20 hover:bg-accent/15 shadow-sm",
  amber: "bg-warning-light text-warning border-warning/20 hover:bg-warning/15 shadow-sm",
  risk: "bg-risk-light text-risk border-risk/20 hover:bg-risk/15 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 shadow-sm",
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
        'transition-all duration-200 animate-soft-fade-scale whitespace-nowrap',
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
          className="inline-flex h-auto p-0 border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
          aria-label={`Trust Level: ${label}. Click for details.`}
        >
          {BadgeComponent}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200" align="start">
        <div className={cn("p-4", badgeVariants[variant], "bg-opacity-50 border-none")}>
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full p-2 bg-white/80 shadow-sm', iconColors[variant])}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight">{label}</h3>
              <p className={cn("text-xs font-semibold uppercase tracking-wider opacity-80", iconColors[variant])}>{subtitle}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-4 bg-background">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="space-y-2" role="group" aria-labelledby="verification-checklist-label">
            <p id="verification-checklist-label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Checklist:</p>
            <div className="space-y-2">
              {requirements.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-foreground/90 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t mt-2">
            <p className="text-[10px] text-muted-foreground leading-normal italic">
              * Badges reflect documentation quality provided by seller and are not legal guarantees of title.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
