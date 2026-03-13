'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Shield, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeValue } from '@/lib/types';

interface BadgeTooltipProps {
  badge: BadgeValue | null;
  className?: string;
}

const badgeInfo: Record<BadgeValue, { title: string; description: string; icon: typeof Shield; color: string }> = {
  TrustedSignal: {
    title: 'Gold - Fully Verified',
    description: 'All documents verified by admin. Seller identity and property ownership confirmed.',
    icon: Shield,
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  EvidenceReviewed: {
    title: 'Silver - Primary Evidence Verified',
    description: 'Title deed and supporting documents verified. Minor documentation items pending.',
    icon: TrendingUp,
    color: 'text-slate-400 dark:text-slate-300',
  },
  EvidenceSubmitted: {
    title: 'Bronze - Evidence Submitted',
    description: 'Seller has submitted documentation. Currently under review by admin team.',
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
  },
  Suspicious: {
    title: 'Flagged - Suspicious Activity',
    description: 'This listing has been flagged for suspicious patterns. Review carefully.',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
  },
  None: {
    title: 'No Verification',
    description: 'Seller has not submitted verification documents yet.',
    icon: HelpCircle,
    color: 'text-muted-foreground',
  },
};

export function BadgeTooltip({ badge, className }: BadgeTooltipProps) {
  const info = badge ? badgeInfo[badge] : badgeInfo.None;
  const Icon = info.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest cursor-help transition-all hover:scale-110',
              info.color,
              className
            )}
            aria-label={`Badge information: ${info.title}`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{info.title.split(' - ')[0]}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-background border-accent/30 shadow-lg"
        >
          <div className="space-y-2">
            <h4 className="font-bold text-sm">{info.title}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {info.description}
            </p>
            <div className="text-[9px] text-muted-foreground/60 pt-1 border-t border-border/30">
              Verification updated: Admin Review System
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
