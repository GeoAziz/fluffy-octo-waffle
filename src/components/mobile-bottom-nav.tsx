'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageSquare, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';

/**
 * MobileBottomNav - Mobile bottom tab navigation (44px+ touch targets)
 * Follows iOS/Android UX conventions with smooth spring animations
 * Responsive: Only visible on screens < 768px (md breakpoint)
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
    <nav 
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-40',
        'border-t border-border/50 bg-background/95 backdrop-blur-md',
        'safe-area-bottom' // Respects notch/safe areas on mobile
      )}
    >
      <div className="flex items-stretch gap-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // Base layout
                'flex-1 flex flex-col items-center justify-center gap-1',
                'relative transition-all duration-300',
                // Touch target minimum (44px height + padding = 56px)
                'min-h-[60px] py-2 px-1',
                // Focus states
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:ring-offset-0',
                // Active state styling with animated background
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground active:scale-95 transition-transform'
              )}
            >
              {/* Animated background indicator for active tab */}
              {isActive && (
                <div
                  className="absolute inset-x-0 top-0 h-1 bg-primary rounded-b-full animate-scale-in origin-top"
                  aria-hidden
                />
              )}

              {/* Icon with animation */}
              <Icon
                className={cn(
                  'h-6 w-6 transition-all duration-300',
                  isActive
                    ? 'text-primary scale-110 animate-bounce-in'
                    : 'text-muted-foreground'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider leading-tight transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}