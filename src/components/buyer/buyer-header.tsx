
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LandPlot,
  LogOut,
  Menu,
  Heart,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
  User,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';
import { auth, db } from '@/lib/firebase';
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
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ThemeToggle } from '@/components/theme-toggle-advanced';
import { BecomeSellerModal } from './become-seller-modal';
import { NotificationBadge } from '@/components/notification-badge';
import { getDiscoveryNavLinks, getPrimaryWorkspace, getWorkspaceSwitchTargets } from '@/lib/workspace-navigation';

export function BuyerHeader() {
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      where('status', '==', 'new')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.filter(doc => doc.data().lastMessage?.senderId !== user.uid).length;
      setUnreadMessages(count);
    });
    return () => unsubscribe();
  }, [user]);

  const role = userProfile?.role;
  const isBuyer = userProfile?.role === 'BUYER';
  const primaryWorkspace = getPrimaryWorkspace(role);
  const workspaceTargets = getWorkspaceSwitchTargets(role);

  const handleLogout = async () => {
    await auth.signOut();
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  const navLinks = getDiscoveryNavLinks(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-16 max-w-7xl items-center gap-4">
        <Link href="/" className="mr-2 flex shrink-0 items-center space-x-2" aria-label="Kenya Land Trust Home">
          <LandPlot className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="hidden font-bold sm:inline-block">Kenya Land Trust</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex" role="navigation" aria-label="Primary Discovery">
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
                <NotificationBadge variant="buyer" />

                <Link href="/messages" className="relative group" aria-label={`You have ${unreadMessages} unread messages`}>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/10">
                    <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {unreadMessages > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-risk text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                        {unreadMessages}
                      </span>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-border/40 shadow-sm" aria-label="Expand User Protocols">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile?.photoURL ?? undefined} alt={userProfile?.displayName ?? ''} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 border-none shadow-2xl rounded-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal px-2 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{userProfile?.displayName}</p>
                        <Badge variant="outline" className="w-fit h-5 text-[8px] font-black uppercase tracking-widest mt-1 border-primary/20 text-primary">
                          {userProfile.role} ACCOUNT
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {primaryWorkspace && (
                      <DropdownMenuItem asChild className="rounded-lg h-11 bg-primary/5 text-primary focus:bg-primary/10">
                        <Link href={primaryWorkspace.href} className="font-bold flex items-center gap-3">
                          <LayoutDashboard className="h-4 w-4" />
                          {primaryWorkspace.label}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {isBuyer && (
                      <DropdownMenuItem
                        onClick={() => setShowBecomeSellerModal(true)}
                        className="rounded-lg h-11 bg-primary/5 hover:bg-primary/10 text-primary focus:bg-primary/10 cursor-pointer"
                      >
                        <Briefcase className="mr-3 h-4 w-4" />
                        <span className="font-semibold">Become a Seller</span>
                      </DropdownMenuItem>
                    )}

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
                      <Link href="/favorites" className="font-medium flex items-center gap-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        Saved Vaults
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg h-11">
                      <Link href="/profile" className="font-medium flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Identity Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-risk font-bold rounded-lg h-11">
                      <LogOut className="mr-3 h-4 w-4" />
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
                <Button asChild variant="default" className="font-black uppercase text-[10px] tracking-widest px-6 shadow-glow">
                  <Link href="/signup">Provision Vault</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center md:hidden">
          {isMounted ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 hover:bg-accent/10 relative" aria-label="Open Mobile Navigation">
                  <Menu className="h-6 w-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-risk rounded-full border-2 border-background animate-pulse" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-sm p-0 border-none shadow-2xl">
                <SheetHeader className="border-b px-6 py-6 bg-muted/10">
                  <SheetTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Registry Access</SheetTitle>
                </SheetHeader>

                <div className="flex max-h-[calc(100dvh-57px)] flex-col overflow-y-auto px-6 py-8">
                  {user && userProfile && (
                    <div className="mb-8 space-y-6">
                      <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-muted/20 border border-border/40">
                        <Avatar className="h-14 w-14 shadow-sm border-2 border-background">
                          <AvatarImage src={userProfile?.photoURL ?? undefined} />
                          <AvatarFallback className="font-black">{userProfile?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black tracking-tight">{userProfile?.displayName}</p>
                          <p className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{userProfile.role}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {primaryWorkspace && (
                          <Link href={primaryWorkspace.href} onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-black uppercase tracking-widest bg-primary/5 text-primary">
                            <LayoutDashboard className="h-5 w-5" />
                            {primaryWorkspace.label}
                          </Link>
                        )}
                        {workspaceTargets
                          .filter((target) => target.href !== primaryWorkspace?.href)
                          .map((target) => (
                            <Link key={target.href} href={target.href} onClick={() => setIsSheetOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all">
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
                        <Link href="/messages" onClick={() => setIsSheetOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-4 text-sm font-bold hover:bg-accent/10 transition-all">
                          <div className="flex items-center gap-4">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Secure Inbox
                          </div>
                          {unreadMessages > 0 && <Badge variant="destructive" className="h-5 px-2 font-black text-[10px]">{unreadMessages}</Badge>}
                        </Link>
                      </div>
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
                      <Button variant="outline" onClick={() => { handleLogout(); setIsSheetOpen(false); }} className="w-full h-14 font-black uppercase text-xs tracking-widest text-risk border-risk/20">
                        <LogOut className="mr-3 h-5 w-5" />
                        Terminate Session
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Button variant="outline" asChild className="h-14 font-black uppercase text-xs tracking-widest">
                          <Link href="/login" onClick={() => setIsSheetOpen(false)}>Terminal Login</Link>
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

      <BecomeSellerModal open={showBecomeSellerModal} onOpenChange={setShowBecomeSellerModal} />
    </header>
  );
}
