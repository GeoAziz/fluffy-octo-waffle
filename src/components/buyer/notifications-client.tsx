'use client';

import { useState, useEffect } from 'react';
import type { Notification } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, MessageSquare, AlertCircle, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { markNotificationAsReadAction, deleteNotificationAction, markAllNotificationsAsReadAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

/**
 * NotificationsClient - Full notifications page with filtering and bulk actions
 * Displays all notifications with ability to filter by type and mark as read
 */
export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filterType, setFilterType] = useState<'all' | Notification['type']>('all');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification))
        .sort((a, b) => b.createdAt?.getTime?.() - a.createdAt?.getTime?.());
      
      setNotifications(notifs);
    }, (error) => {
      console.error('Error fetching notifications:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadAction(notificationId);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not mark notification as read.',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    setDeletingId(notificationId);
    try {
      await deleteNotificationAction(notificationId);
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the notification.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsAsReadAction();
      toast({
        title: 'Marked all as read',
        description: `All ${unreadCount} unread notifications have been marked as read.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not mark all notifications as read.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-5 w-5 text-accent" />;
      case 'badge_update':
        return <Bell className="h-5 w-5 text-emerald-500" />;
      case 'flag':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.link) return notification.link;
    
    switch (notification.type) {
      case 'inquiry':
        return '/messages';
      case 'badge_update':
      case 'flag':
        return '/profile';
      default:
        return '/';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Card with Filters */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">
                All Notifications ({notifications.length})
              </CardTitle>
              <CardDescription className="mt-2 text-sm font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
                <SelectTrigger className="h-10 w-full sm:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="inquiry">Inquiries</SelectItem>
                  <SelectItem value="badge_update">Badge Updates</SelectItem>
                  <SelectItem value="flag">Flags</SelectItem>
                  <SelectItem value="system">System Messages</SelectItem>
                </SelectContent>
              </Select>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="h-10 font-bold uppercase text-xs tracking-widest"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed bg-muted/10">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-bold uppercase tracking-tight mb-2">No Notifications</h3>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {filterType === 'all'
                ? "You don't have any notifications yet. Check back soon!"
                : `No ${filterType.replace('_', ' ')} notifications.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border transition-all',
                !notification.read
                  ? 'bg-primary/5 border-primary/30 hover:border-primary/50 hover:bg-primary/10'
                  : 'bg-background border-border/40 hover:border-border/60 hover:bg-muted/30'
              )}
            >
              <div className="mt-1 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold leading-tight">
                    {notification.title}
                  </h4>
                  <Badge variant={notification.type === 'flag' ? 'destructive' : 'secondary'} className="text-[9px] uppercase font-black tracking-widest flex-shrink-0">
                    {notification.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                  {formatDistanceToNow(notification.createdAt?.toDate?.() || new Date(), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleMarkAsRead(notification.id);
                    }}
                    className="h-2 w-2 rounded-full bg-primary hover:bg-primary/80 transition-colors"
                    title="Mark as read"
                  />
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === notification.id}
                    >
                      {deletingId === notification.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-black uppercase tracking-tight">Delete Notification?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium">
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-bold uppercase text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(notification.id)}
                        className="bg-destructive text-white font-bold uppercase text-xs"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
