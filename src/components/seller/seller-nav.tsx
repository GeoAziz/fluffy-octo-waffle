'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LandPlot, LayoutDashboard, MessageSquare, User, Settings, List, HelpCircle, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { ThemeToggle } from '@/components/theme-toggle';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { calculateSellerTier, getTierProgress, getTierDescription, type SellerTier } from '@/lib/seller-tier';

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
  const [sellerTier, setSellerTier] = useState<SellerTier>('Unverified');
  const [tierDescription, setTierDescription] = useState('');
  const [tierProgress, setTierProgress] = useState(0);

  // Fetch and calculate seller tier from listings
  useEffect(() => {
    if (!userProfile?.uid) return;

    const listingsQuery = query(
      collection(db, 'listings'),
      where('ownerId', '==', userProfile.uid),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      const badges = snapshot.docs
        .map(doc => doc.data().badge)
        .filter((badge): badge is string => badge !== null && badge !== undefined);
      
      const tier = calculateSellerTier(badges);
      const progress = getTierProgress(tier);
      const description = getTierDescription(tier);

      setSellerTier(tier);
      setTierProgress(progress);
      setTierDescription(description);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

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
      <SidebarHeader className="border-b">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LandPlot className="size-6 text-primary" />
          <h2 className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            KLT
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6">
        {/* Badge Progress Widget */}
        <div className="px-2 mb-2 group-data-[collapsible=icon]:hidden">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-sm">
            <CardHeader className="pb-3 pt-4"><CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Trust Badge Progress</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold">Verification Tier</span>
                  <span className="text-primary font-black">{sellerTier}</span>
                </div>
                <Progress value={tierProgress} className="h-1.5" />
              </div>
              <p className="text-[9px] text-muted-foreground font-medium">{tierDescription}</p>
            </CardContent>
          </Card>
        </div>
        {/* Workspace Section */}
        <div className="px-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 group-data-[collapsible=icon]:hidden">
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
                    className="min-h-10"
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

        {/* Account Section */}
        <div className="px-2 border-t pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 group-data-[collapsible=icon]:hidden">
            Account
          </p>
          <SidebarMenu>
            {accountItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="min-h-10"
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

        {/* Help Section */}
        <div className="px-2 border-t pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/contact" passHref>
                <SidebarMenuButton tooltip="Get Help" className="min-h-10">
                  <HelpCircle className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Get Help</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between px-2 mb-4 group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        {userProfile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? ''} />
                <AvatarFallback className="text-sm font-semibold">{userProfile.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden min-w-0">
                <span className="text-sm font-semibold truncate">{userProfile.displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start group-data-[collapsible=icon]:p-2"
            >
              <LogOut className="size-4 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </>
  );
}
