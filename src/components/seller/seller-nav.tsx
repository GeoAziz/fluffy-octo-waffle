'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LandPlot, LayoutDashboard, MessageSquare, User, Settings, List, HelpCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';

const workspaceItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & analytics' },
  { href: '/dashboard/listings', label: 'Listings', icon: List, description: 'Manage your properties' },
  { href: '/messages', label: 'Messages', icon: MessageSquare, description: 'Talk with buyers' },
];

const accountItems = [
  { href: '/profile', label: 'Profile', icon: User, description: 'Your information' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];

export function SellerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();
  const isListingsActive =
    pathname === '/dashboard/listings' ||
    pathname.startsWith('/dashboard/listings/') ||
    pathname === '/listings/new' ||
    pathname.endsWith('/edit');

  const handleLogout = async () => {
    await auth.signOut();
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border/70 bg-sidebar/80">
        <Link href="/" className="flex items-center gap-3 rounded-md p-1 transition-opacity hover:opacity-80">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <LandPlot className="size-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-base font-bold tracking-tight">KLT Seller</h2>
            <p className="text-xs text-muted-foreground">Control center</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-5 px-1 py-2">
        <div className="mx-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Seller tip
          </div>
          Complete listing details and images to improve approval speed and buyer trust.
        </div>

        <div className="px-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
            Workspace
          </p>
          <SidebarMenu>
            {workspaceItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={
                      item.href === '/dashboard/listings'
                        ? isListingsActive
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                    }
                    tooltip={item.label}
                    className="min-h-11 rounded-lg"
                  >
                    <item.icon className="size-5" />
                    <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="border-t border-sidebar-border/70 px-2 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
            Account
          </p>
          <SidebarMenu>
            {accountItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="min-h-10 rounded-lg"
                  >
                    <item.icon className="size-5" />
                    <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="border-t border-sidebar-border/70 px-2 pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/contact" passHref>
                <SidebarMenuButton tooltip="Get Help" className="min-h-10 rounded-lg">
                  <HelpCircle className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Get Help</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/70">
        {userProfile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/60 bg-sidebar-accent/40 p-2.5 transition-colors hover:bg-sidebar-accent/70">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? ''} />
                <AvatarFallback className="text-sm font-semibold">{userProfile.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">{userProfile.displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{userProfile.email}</span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start group-data-[collapsible=icon]:p-2"
            >
              <LogOut className="mr-2 size-4" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </>
  );
}
