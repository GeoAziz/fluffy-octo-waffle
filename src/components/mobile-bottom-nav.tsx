'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageSquare, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';

/**
 * MobileBottomNav - Primary mobile navigation bar
 * Thumb-accessible actions for public and authenticated buyers
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/favorites', label: 'Saved', icon: Heart },
    { href: '/messages', label: 'Inbox', icon: MessageSquare },
  ];

  if (user && userProfile) {
    const dashboardUrl = userProfile.role === 'BUYER' ? '/buyer/dashboard' : '/dashboard';
    navItems.push({ href: dashboardUrl, label: 'Account', icon: LayoutDashboard });
  } else {
    navItems.push({ href: '/login', label: 'Sign In', icon: LayoutDashboard });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-tighter transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("size-5", isActive && "fill-primary/10")} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}