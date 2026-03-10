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
        'rounded-xl border-2 border-dashed px-6 py-12 text-center sm:px-10 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background/50',
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 transition-transform duration-500 hover:scale-110 shadow-sm">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-3 text-sm text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {children && <div className="mt-6 text-sm text-muted-foreground">{children}</div>}
      {actions.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
                  className="font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
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
                className="font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
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
