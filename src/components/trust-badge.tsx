import { Badge } from '@/components/ui/badge';
import type { BadgeStatus } from '@/lib/types';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileClock,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type BadgeInfo = {
  variant: 'success' | 'destructive' | 'secondary' | 'warning' | 'outline';
  icon: React.ElementType;
  label: string;
  description: string;
};

const badgeMap: Record<BadgeStatus, BadgeInfo> = {
  TrustedSignal: {
    variant: 'success',
    icon: ShieldCheck,
    label: 'Trusted Signal',
    description: 'Evidence reviewed and verified by our team.',
  },
  EvidenceReviewed: {
    variant: 'secondary',
    icon: FileCheck,
    label: 'Evidence Reviewed',
    description: 'Our team has reviewed the submitted evidence.',
  },
  EvidenceSubmitted: {
    variant: 'warning',
    icon: FileClock,
    label: 'Evidence Submitted',
    description: 'Seller has submitted evidence for review.',
  },
  Suspicious: {
    variant: 'destructive',
    icon: ShieldAlert,
    label: 'Suspicious',
    description: 'This listing has been flagged for suspicious activity.',
  },
  None: {
    variant: 'outline',
    icon: HelpCircle,
    label: 'No Evidence',
    description: 'Seller has not submitted any evidence for this listing.',
  },
};

export function TrustBadge({
  status,
  className,
}: {
  status: BadgeStatus;
  className?: string;
}) {
  if (status === 'None') {
    return null;
  }
  const { variant, icon: Icon, label, description } = badgeMap[status];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            className={`animate-soft-fade-scale cursor-help ${className}`}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
