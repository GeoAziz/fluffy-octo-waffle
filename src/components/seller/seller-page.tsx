'use client';

import { PropsWithChildren } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface SellerPageProps extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * SellerPage - Page wrapper for seller workspace
 * NOTE: Do NOT wrap with SellerShell - the layout already provides sidebar structure
 * Just provides the page header and content layout
 */
export function SellerPage({ title, description, actions, children }: SellerPageProps) {
  return (
    <div className="flex w-full h-full flex-col overflow-hidden">
      <header className="sticky top-0 z-10 flex w-full flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div className="flex w-full items-center gap-4">
          <div className="lg:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl" title={title}>{title}</h1>
            {description && <p className="mt-2 text-sm text-muted-foreground truncate">{description}</p>}
          </div>
        </div>
        {actions && <div className="mt-2 flex w-full items-center justify-end gap-2 sm:mt-0 sm:w-auto">{actions}</div>}
      </header>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 w-full">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
