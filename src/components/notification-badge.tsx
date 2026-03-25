'use client';

import { useEffect, useState } from 'react';
import { Bell, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/providers';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsReadAction } from '@/app/actions';
import { toDateSafe } from '@/lib/utils';

interface NotificationBadgeProps {
  variant?: 'buyer' | 'seller' | 'admin';
}

/**
 * NotificationBadge - Real-time notification dropdown with unread count badge
 * Displays notifications with type-specific icons and allows marking as read
 * 
 * Features:
 * - Live Firestore listener for real-time updates
 * - Unread count badge on bell icon
 * - Type-specific icons (inquiry, badge_update, flag, system)
 * - Quick mark-as-read action
 * - Links to relevant pages (messages, listings, profile, etc.)
 */
export function NotificationBadge({ variant = 'buyer' }: NotificationBadgeProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for user's notifications
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification))
        .sort((a, b) => {
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          return bTime - aTime;
        });
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadAction(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-accent" />;
      case 'badge_update':
        return <Badge className="h-4 w-4 text-emerald-500" />;
      case 'flag':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'system':
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.link) return notification.link;
    
    // Default routing based on type
    switch (notification.type) {
      case 'inquiry':
        return '/buyer/messages';
      case 'badge_update':
      case 'flag':
        return '/profile';
      default:
        return '/';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-10 w-10 rounded-full ${variant === 'admin' ? 'text-primary' : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="font-black uppercase tracking-widest text-xs">
          Notifications ({unreadCount})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground italic">
            No notifications yet. Stay tuned!
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.slice(0, 8).map(notification => (
              <div key={notification.id} className={`px-2 py-2 ${!notification.read ? 'bg-primary/5' : ''}`}>
                <Link
                  href={getNotificationLink(notification)}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                      {notification.title}
                      {!notification.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                      {formatDistanceToNow(
                        toDateSafe(notification.createdAt) ?? new Date(),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleMarkAsRead(notification.id);
                      }}
                      className="flex-shrink-0 h-2 w-2 rounded-full bg-primary hover:bg-primary/80 transition-colors"
                      title="Mark as read"
                    />
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full text-center justify-center font-semibold uppercase text-xs tracking-widest py-2">
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
