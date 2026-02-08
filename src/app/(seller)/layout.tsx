'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { SellerNav } from '@/components/seller/seller-nav';

/**
 * SellerLayout - Layout for seller workspace
 * Provides sidebar navigation and workspace layout
 * Workspace footers are NOT needed - they clutter the interface
 * Used for all seller-protected routes (/dashboard, /listings, etc)
 * AuthProvider is at the root level and available globally
 */
export default function SellerLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="w-full h-screen">
      <Sidebar>
        <SellerNav />
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
