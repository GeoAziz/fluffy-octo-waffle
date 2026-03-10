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
  animated?: boolean;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  actions = [],
  className,
  children,
  animated = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 px-6 py-12 md:py-20 text-center sm:px-10',
        'bg-gradient-to-br from-background to-background/50',
        'transition-all duration-300',
        animated && 'animate-fade-in',
        className
      )}
    >
      {/* Icon with animation */}
      {Icon && (
        <div className={cn(
          'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full',
          'bg-gradient-to-br from-muted/60 to-muted/30',
          'shadow-md transition-all duration-300 hover:scale-110 motion-safe:hover:shadow-lg',
          animated && 'animate-scale-in'
        )}>
          <Icon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      )}

      {/* Title with animation */}
      <h3 className={cn(
        'text-2xl md:text-3xl font-bold tracking-tight text-foreground',
        animated && 'animate-slide-up'
      )} style={animated ? { animationDelay: '100ms' } : undefined}>
        {title}
      </h3>

      {/* Description with animation */}
      {description && (
        <p className={cn(
          'mt-3 text-base text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed',
          animated && 'animate-slide-up'
        )} style={animated ? { animationDelay: '150ms' } : undefined}>
          {description}
        </p>
      )}

      {/* Custom children */}
      {children && (
        <div className={cn(
          'mt-6 text-sm text-muted-foreground',
          animated && 'animate-slide-up'
        )} style={animated ? { animationDelay: '200ms' } : undefined}>
          {children}
        </div>
      )}

      {/* Actions with stagger animation */}
      {actions.length > 0 && (
        <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            const buttonContent = (
              <>
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
              </>
            );

            const content = (
              <Button
                onClick={action.onClick}
                variant={action.variant ?? 'default'}
                size={action.size}
                className={cn(
                  'font-semibold uppercase tracking-wide h-12 px-6 md:px-8',
                  'shadow-sm hover:shadow-md transition-all duration-300',
                  'active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-slate-950',
                  'touch-target', // 44px minimum height for mobile
                  animated && 'animate-slide-up',
                  'min-h-[44px]' // Explicit mobile accessibility
                )}
                style={animated ? { animationDelay: `${250 + idx * 50}ms` } : undefined}
              >
                {buttonContent}
              </Button>
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={action.label}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
