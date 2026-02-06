import { Badge } from '@/components/ui/badge';
import type { ListingStatus } from '@/lib/types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type BadgeInfo = {
  variant: 'success' | 'destructive' | 'secondary' | 'warning' | 'outline';
  icon: React.ElementType;
  label: string;
  description: string;
};

const badgeMap: Record<ListingStatus, BadgeInfo> = {
  approved: {
    variant: 'success',
    icon: ShieldCheck,
    label: 'Approved',
    description: 'This listing has been reviewed and approved by our team.',
  },
  pending: {
    variant: 'warning',
    icon: ShieldQuestion,
    label: 'Pending',
    description: 'This listing is pending review from our team.',
  },
  rejected: {
    variant: 'destructive',
    icon: ShieldAlert,
    label: 'Rejected',
    description: 'This listing was rejected after review. Proceed with caution.',
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ListingStatus;
  className?: string;
}) {
  const { variant, icon: Icon, label, description } = badgeMap[status];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            className={cn('cursor-help', className)}
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
