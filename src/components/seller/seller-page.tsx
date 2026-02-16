'use client';

import { PropsWithChildren } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface SellerPageProps extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

/**
 * SellerPage - Page wrapper for seller workspace
 * NOTE: Do NOT wrap with SellerShell - the layout already provides sidebar structure
 * Just provides the page header and content layout
 */
export function SellerPage({ title, description, actions, children, eyebrow = 'Seller Workspace' }: SellerPageProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-start gap-4">
            <div className="pt-1 lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Badge variant="outline" className="w-fit text-[11px] uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </Badge>
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl" title={title}>{title}</h1>
              {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex w-full items-center justify-end gap-2 sm:w-auto">{actions}</div>}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-muted/30 via-background to-background px-6 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
