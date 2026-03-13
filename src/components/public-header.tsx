'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LandPlot,
  LogOut,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  User,
  Briefcase,
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
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle-advanced';
import { getDiscoveryNavLinks, getPrimaryWorkspace, getWorkspaceSwitchTargets } from '@/lib/workspace-navigation';

/**
 * PublicHeader — Neutral top navigation for public-facing and shared routes.
 * Role-aware: shows the correct primary workspace and nav links per role,
 * but does not include buyer-specific features (notification badges, etc.).
 */
export function PublicHeader() {
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const role = userProfile?.role;
  const primaryWorkspace = getPrimaryWorkspace(role);
  const workspaceTargets = getWorkspaceSwitchTargets(role);
  const navLinks = getDiscoveryNavLinks(role);

  const handleLogout = async () => {
    await auth.signOut();
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-16 max-w-7xl items-center gap-4">
        <Link href="/" className="mr-2 flex shrink-0 items-center space-x-2" aria-label="Kenya Land Trust Home">
          <LandPlot className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="hidden font-bold sm:inline-block">Kenya Land Trust</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex" role="navigation" aria-label="Primary Navigation">
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

        {/* Desktop user controls */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : user && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-border/40 shadow-sm" aria-label="Open user menu">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile.photoURL ?? undefined} alt={userProfile.displayName ?? ''} />
                    <AvatarFallback>{userProfile.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 border-none shadow-2xl rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{userProfile.displayName}</p>
                    <Badge variant="outline" className="w-fit h-5 text-[8px] font-black uppercase tracking-widest mt-1 border-primary/20 text-primary">
                      {userProfile.role} ACCOUNT
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Primary workspace link */}
                {primaryWorkspace && (
                  <DropdownMenuItem asChild className="rounded-lg h-11 bg-primary/5 text-primary focus:bg-primary/10">
                    <Link href={primaryWorkspace.href} className="font-bold flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4" />
                      {primaryWorkspace.label}
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Switch Workspace (for multi-workspace roles like ADMIN) */}
                {workspaceTargets.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1">
                      Switch Workspace
                    </DropdownMenuLabel>
                    {workspaceTargets
                      .filter((target) => target.href !== primaryWorkspace?.href)
                      .map((target) => (
                        <DropdownMenuItem key={target.href} asChild className="rounded-lg h-11">
                          <Link href={target.href} className="font-medium flex items-center gap-3">
                            {target.href.startsWith('/admin') ? (
                              <ShieldCheck className="h-4 w-4 text-risk" />
                            ) : target.href.startsWith('/dashboard') ? (
                              <Briefcase className="h-4 w-4 text-accent" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                            {target.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg h-11">
                  <Link href="/profile" className="font-medium flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-risk font-bold rounded-lg h-11">
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="font-bold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" className="font-black uppercase text-[10px] tracking-widest px-6 shadow-glow">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center md:hidden">
          <ThemeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-accent/10" aria-label="Open Mobile Navigation">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm p-0 border-none shadow-2xl">
              <SheetHeader className="border-b px-6 py-6 bg-muted/10">
                <SheetTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Navigation</SheetTitle>
              </SheetHeader>

              <div className="flex max-h-[calc(100dvh-57px)] flex-col overflow-y-auto px-6 py-8">
                {user && userProfile && (
                  <div className="mb-8 space-y-4">
                    <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-muted/20 border border-border/40">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={userProfile.photoURL ?? undefined} />
                        <AvatarFallback className="font-black">{userProfile.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black tracking-tight">{userProfile.displayName}</p>
                        <p className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{userProfile.role}</p>
                      </div>
                    </div>

                    {primaryWorkspace && (
                      <Link
                        href={primaryWorkspace.href}
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-black uppercase tracking-widest bg-primary/5 text-primary"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        {primaryWorkspace.label}
                      </Link>
                    )}

                    {workspaceTargets
                      .filter((target) => target.href !== primaryWorkspace?.href)
                      .map((target) => (
                        <Link
                          key={target.href}
                          href={target.href}
                          onClick={() => setIsSheetOpen(false)}
                          className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all"
                        >
                          {target.href.startsWith('/admin') ? (
                            <ShieldCheck className="h-5 w-5 text-risk" />
                          ) : target.href.startsWith('/dashboard') ? (
                            <Briefcase className="h-5 w-5 text-accent" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                          {target.label}
                        </Link>
                      ))}

                    <Link
                      href="/profile"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all"
                    >
                      <User className="h-5 w-5 text-primary" />
                      My Profile
                    </Link>
                  </div>
                )}

                <div className="space-y-2 pt-6 border-t border-border/40">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={cn(
                        'block rounded-xl px-4 py-4 text-base font-black uppercase tracking-widest transition-all',
                        pathname === link.href ? 'bg-primary text-white' : 'text-foreground/70 hover:bg-muted/50',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-border/40">
                  {user && userProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => { handleLogout(); setIsSheetOpen(false); }}
                      className="w-full h-14 font-black uppercase text-xs tracking-widest text-risk border-risk/20"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button variant="outline" asChild className="h-14 font-black uppercase text-xs tracking-widest">
                        <Link href="/login" onClick={() => setIsSheetOpen(false)}>Sign In</Link>
                      </Button>
                      <Button asChild className="h-14 font-black uppercase text-xs tracking-widest shadow-glow">
                        <Link href="/signup" onClick={() => setIsSheetOpen(false)}>Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
