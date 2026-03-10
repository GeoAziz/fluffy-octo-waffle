'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface RiskScoreBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * RiskScoreBadge - Visual risk indicator for admin listings review queue.
 * Displays risk score 0-100 with visual severity levels and animations.
 */
export function RiskScoreBadge({
  score,
  className,
  showLabel = true,
}: RiskScoreBadgeProps) {
  // Determine risk level and visual styling
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertTriangle, glow: 'shadow-[0_0_12px_rgba(220,38,38,0.2)]' };
    if (score >= 50) return { level: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: TrendingDown, glow: 'shadow-[0_0_12px_rgba(234,88,12,0.15)]' };
    if (score >= 30) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', icon: TrendingDown, glow: '' };
    return { level: 'Low', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', icon: CheckCircle2, glow: '' };
  };

  const risk = getRiskLevel(score);
  const Icon = risk.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-current/10 transition-all duration-300',
        risk.bg,
        risk.color,
        score >= 70 && 'animate-badge-glow',
        className,
        risk.glow
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex items-baseline gap-1.5">
        <span className="font-bold tabular-nums">{score}</span>
        {showLabel && (
          <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
            {risk.level}
          </span>
        )}
      </div>
    </div>
  );
}

interface ListingQueueItemProps {
  listing: {
    id: string;
    title: string;
    owner: string;
    createdAt: Date;
    aiRiskScore?: number;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  };
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

/**
 * ListingQueueItem - Single listing in admin review queue with risk scoring.
 * Displays all relevant information with hover animations and visual hierarchy.
 */
export function ListingQueueItem({
  listing,
  onSelect,
  isSelected = false,
}: ListingQueueItemProps) {
  return (
    <button
      onClick={() => onSelect?.(listing.id)}
      className={cn(
        'w-full group relative p-4 rounded-lg border transition-all duration-300',
        'hover:bg-accent/5 dark:hover:bg-accent/10',
        'hover:border-accent/40 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950',
        isSelected && 'bg-accent/10 border-accent/40 shadow-md'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            by {listing.owner}
          </p>
        </div>

        {listing.aiRiskScore !== undefined && (
          <div className="flex-shrink-0">
            <RiskScoreBadge score={listing.aiRiskScore} showLabel={false} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 gap-2 text-xs text-muted-foreground">
        <span>
          {new Date(listing.createdAt).toLocaleDateString()}
        </span>
        <span className={cn(
          'px-2.5 py-1 rounded-full font-medium uppercase tracking-wide',
          listing.status === 'pending' && 'bg-warning/10 text-warning dark:text-warning',
          listing.status === 'reviewing' && 'bg-accent/10 text-accent dark:text-accent',
          listing.status === 'approved' && 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
          listing.status === 'rejected' && 'bg-destructive/10 text-destructive dark:text-red-400',
        )}>
          {listing.status}
        </span>
      </div>
    </button>
  );
}
