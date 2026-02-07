'use client';

import { PropsWithChildren } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SellerShell } from './seller-shell';

interface SellerPageProps extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SellerPage({ title, description, actions, children }: SellerPageProps) {
  return (
    <SellerShell>
      <div className="flex w-full h-full flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-auto min-h-16 flex-wrap items-center justify-between gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-4 w-full">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1 space-y-0.5 min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl" title={title}>{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 w-full">
          {children}
        </div>
      </div>
    </SellerShell>
  );
}
