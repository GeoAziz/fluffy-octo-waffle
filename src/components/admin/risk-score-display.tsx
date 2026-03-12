
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
  className?: string;
}

/**
 * ListingQueueItem - Single listing in admin review queue with risk scoring.
 */
export function ListingQueueItem({
  listing,
  onSelect,
  isSelected = false,
  className,
}: ListingQueueItemProps) {
  return (
    <button
      onClick={() => onSelect?.(listing.id)}
      className={cn(
        'group relative p-4 rounded-xl border transition-all duration-300',
        'hover:bg-accent/5 dark:hover:bg-accent/10',
        'hover:border-accent/40 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        isSelected ? 'bg-accent/5 border-accent/40 shadow-sm' : 'bg-card',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-left">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 uppercase text-sm tracking-tight">
            {listing.title}
          </h3>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">
            Seller Node: {listing.owner}
          </p>
        </div>

        {listing.aiRiskScore !== undefined && (
          <div className="flex-shrink-0">
            <RiskScoreBadge score={listing.aiRiskScore} showLabel={false} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
        <div className="flex items-center gap-2">
          <span>Vaulted: {new Date(listing.createdAt).toLocaleDateString()}</span>
          <span className="opacity-30">•</span>
          <span className="font-mono">{listing.id}</span>
        </div>
        <Badge variant="outline" className={cn(
          'text-[9px] font-black uppercase tracking-widest border-none h-5 px-2',
          listing.status === 'pending' && 'bg-warning/10 text-warning',
          listing.status === 'approved' && 'bg-emerald-500 text-white',
          listing.status === 'rejected' && 'bg-risk text-white',
        )}>
          {listing.status}
        </Badge>
      </div>
    </button>
  );
}
