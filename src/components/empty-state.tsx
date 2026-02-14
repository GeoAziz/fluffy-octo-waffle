'use client';

import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: ComponentProps<typeof Button>['variant'];
  size?: ComponentProps<typeof Button>['size'];
  icon?: React.ComponentType<{ className?: string }>;
};

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: EmptyStateAction[];
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  actions = [],
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed px-6 py-12 text-center sm:px-10',
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-6 text-sm text-muted-foreground">{children}</div>}
      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            const buttonContent = (
              <>
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
              </>
            );

            if (action.href) {
              return (
                <Button
                  key={action.label}
                  asChild
                  variant={action.variant ?? 'default'}
                  size={action.size}
                >
                  <Link href={action.href}>{buttonContent}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={action.label}
                onClick={action.onClick}
                variant={action.variant ?? 'default'}
                size={action.size}
              >
                {buttonContent}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
