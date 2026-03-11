'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LandPlot,
  LogOut,
  UserCircle,
  Menu,
  Heart,
  MessageSquare,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';
import { auth } from '@/lib/firebase';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle-advanced';

/**
 * BuyerHeader - Premium navigation system for the high-trust marketplace.
 * Features ThemeToggleAdvanced and standardized Badge integration.
 */
export function BuyerHeader() {
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSeller = userProfile?.role === 'SELLER' || userProfile?.role === 'ADMIN';

  const handleLogout = async () => {
    await auth.signOut();
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/explore', label: 'Browse Listings' },
    { href: '/trust', label: 'How It Works' },
    { href: '/contact', label: 'About' },
  ];

  const dashboardUrl = isSeller ? '/dashboard' : '/buyer/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center gap-4">
        <Link href="/" className="mr-2 flex shrink-0 items-center space-x-2">
          <LandPlot className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">Kenya Land Trust</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-medium transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : user && userProfile ? (
              <>
                <Button asChild className="hidden lg:inline-flex" variant="outline" size="sm">
                  <Link href={dashboardUrl}>Dashboard</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-border/40 shadow-sm" aria-label="Open user menu">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile?.photoURL ?? undefined} alt={userProfile?.displayName ?? ''} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{userProfile?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground uppercase font-black tracking-widest mt-1">
                          {userProfile.role} ACCOUNT
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href={dashboardUrl} className="font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="font-medium">
                        <Heart className="mr-2 h-4 w-4" />
                        Saved Vaults
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="font-medium">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="font-medium">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile Protocol
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-risk font-bold">
                      <LogOut className="mr-2 h-4 w-4" />
                      Terminate Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="font-bold">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="default" className="font-black uppercase text-[10px] tracking-widest">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center md:hidden">
          {isMounted ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-accent/10" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle className="text-sm font-black uppercase tracking-widest">Navigation Center</SheetTitle>
                </SheetHeader>

                <div className="flex max-h-[calc(100dvh-57px)] flex-col overflow-y-auto px-4 py-6">
                  {user && userProfile && (
                    <div className="mb-8">
                      <div className="mb-6 flex items-center gap-4 px-3 py-3 rounded-xl bg-muted/20 border border-border/40">
                        <Avatar className="h-14 w-14 flex-shrink-0 shadow-sm">
                          <AvatarImage src={userProfile?.photoURL ?? undefined} alt={userProfile?.displayName ?? ''} />
                          <AvatarFallback className="text-xl font-black">
                            {userProfile?.displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black tracking-tight">{userProfile?.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{userProfile?.email}</p>
                          <Badge variant="accent" className="mt-2 h-5 text-[9px] font-black uppercase tracking-widest border-none">
                            {userProfile?.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link href={dashboardUrl} onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all border border-transparent">
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                          Dashboard
                        </Link>
                        {isSeller && (
                          <Link href="/dashboard/listings" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all border border-transparent">
                            <PlusCircle className="h-5 w-5 text-primary" />
                            My Listings
                          </Link>
                        )}
                        <Link href="/messages" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all border border-transparent">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          Inbox
                        </Link>
                        <Link href="/favorites" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all border border-transparent">
                          <Heart className="h-5 w-5 text-primary" />
                          Saved Vaults
                        </Link>
                        <Link href="/profile" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all border border-transparent">
                          <UserCircle className="h-5 w-5 text-primary" />
                          Profile Protocol
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 border-t pt-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsSheetOpen(false)}
                        className={cn(
                          'block rounded-xl px-4 py-4 text-base font-black uppercase tracking-widest transition-all border border-transparent',
                          pathname === link.href
                            ? 'bg-primary text-white shadow-md'
                            : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground',
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto pt-8">
                    {user && userProfile ? (
                      <Button variant="outline" onClick={() => { handleLogout(); setIsSheetOpen(false); }} className="w-full h-14 font-black uppercase text-xs tracking-widest text-risk border-risk/20">
                        <LogOut className="mr-2 h-5 w-5" />
                        Terminate Session
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Button variant="outline" asChild className="h-14 font-black uppercase text-xs tracking-widest">
                          <Link href="/login" onClick={() => setIsSheetOpen(false)}>Terminal Access</Link>
                        </Button>
                        <Button asChild className="h-14 font-black uppercase text-xs tracking-widest shadow-glow">
                          <Link href="/signup" onClick={() => setIsSheetOpen(false)}>Provision Vault</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Skeleton className="h-11 w-11 rounded-full" />
          )}
        </div>
      </div>
    </header>
  );
}
