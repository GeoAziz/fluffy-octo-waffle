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
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center gap-4">
        <Link href="/" className="mr-2 flex shrink-0 items-center space-x-2" aria-label="Kenya Land Trust Home">
          <LandPlot className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="hidden font-bold sm:inline-block">Kenya Land Trust</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-medium transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60',
              )}
              aria-current={pathname === link.href ? 'page' : undefined}
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
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" aria-label="User menu">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile?.photoURL ?? undefined} alt={userProfile?.displayName ?? ''} />
                        <AvatarFallback aria-hidden="true">{userProfile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile.role.charAt(0) + userProfile.role.slice(1).toLowerCase()} Account
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href={dashboardUrl}>
                        <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/favorites">
                        <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                        Messages
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="accent">
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
                <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Open mobile navigation menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>

                <div className="flex max-h-[calc(100dvh-57px)] flex-col overflow-y-auto px-4 py-4 pb-safe">
                  {user && userProfile && (
                    <div className="mb-6">
                      <div className="mb-4 flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={userProfile?.photoURL ?? undefined} alt={userProfile?.displayName ?? ''} />
                          <AvatarFallback className="text-lg font-bold" aria-hidden="true">
                            {userProfile?.displayName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{userProfile?.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{userProfile?.email}</p>
                          <p className="mt-1 text-xs font-medium text-primary">{userProfile?.role}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link href={dashboardUrl} onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/50">
                          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                          Dashboard
                        </Link>
                        {isSeller && (
                          <Link href="/dashboard/listings" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/50">
                            <PlusCircle className="h-5 w-5" aria-hidden="true" />
                            My Listings
                          </Link>
                        )}
                        <Link href="/messages" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/50">
                          <MessageSquare className="h-5 w-5" aria-hidden="true" />
                          Messages
                        </Link>
                        <Link href="/favorites" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/50">
                          <Heart className="h-5 w-5" aria-hidden="true" />
                          Saved Properties
                        </Link>
                        <Link href="/profile" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/50">
                          <UserCircle className="h-5 w-5" aria-hidden="true" />
                          Profile
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 border-t pt-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsSheetOpen(false)}
                        className={cn(
                          'block rounded-md px-3 py-3 text-sm font-medium transition-colors',
                          pathname === link.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 border-t px-2 pt-4">
                    {user && userProfile ? (
                      <Button variant="outline" onClick={() => { handleLogout(); setIsSheetOpen(false); }} className="w-full h-12">
                        <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                        Log out
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button variant="outline" asChild className="h-12">
                          <Link href="/login" onClick={() => setIsSheetOpen(false)}>Sign In</Link>
                        </Button>
                        <Button asChild className="h-12">
                          <Link href="/signup" onClick={() => setIsSheetOpen(false)}>List Your Land</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Skeleton className="h-9 w-9" />
          )}
        </div>
      </div>
    </header>
  );
}
