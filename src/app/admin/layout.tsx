import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { AdminNav } from './_components/admin-nav';

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="w-full h-screen">
      <Sidebar>
        <AdminNav />
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
