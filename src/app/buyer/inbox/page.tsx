'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

/**
 * Buyer Inbox Landing
 * 
 * Unified command center for buyer follow-up:
 * - Conversations (buyer-seller messaging threads)
 * - Alerts (listing updates, search alerts, admin notices)
 * - Priority (blended actionable items)
 * 
 * This is the primary landing page for /buyer/inbox
 * Sub-pages like /buyer/messages/[id] are the conversation detail views
 */
type NextAction = {
  title: string;
  href: string;
  action: string;
} | null;

export default function InboxPage() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [nextAction, setNextAction] = useState<NextAction>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch unread messages, alerts, and next action from Firebase
    // This is a placeholder implementation
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Status at a glance */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Inbox</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Unread Messages Card */}
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadMessages === 0 ? 'All caught up' : 'Unread from sellers'}
              </p>
            </CardContent>
          </Card>

          {/* Unread Alerts Card */}
          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {unreadAlerts === 0 ? 'No updates' : 'New updates'}
              </p>
            </CardContent>
          </Card>

          {/* Next Action Card */}
          <Card className={`border-l-4 ${nextAction ? 'border-l-primary' : 'border-l-muted'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAction ? (
                <>
                  <p className="font-medium text-sm">{nextAction.title}</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-8" asChild>
                    <Link href={nextAction.href}>Go to {nextAction.action}</Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Explore verified listings to get started
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="priority" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="priority" className="relative">
            Priority
            {(unreadMessages + unreadAlerts) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {unreadMessages + unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="relative">
            Messages
            {unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {unreadMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Priority View (default) */}
        <TabsContent value="priority" className="space-y-4">
          {unreadMessages === 0 && unreadAlerts === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up!"
              description="No new messages or alerts. Explore verified listings to start your property search."
              actions={[
                { label: 'Browse Listings', href: '/explore' }
              ]}
            />
          ) : (
            <div className="space-y-4">
              {/* Messages in Priority view */}
              {unreadMessages > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Messages</h3>
                  <Button variant="outline" className="w-full justify-start h-12" asChild>
                    <Link href="/buyer/messages">
                      <MessageSquare className="h-4 w-4 mr-3 text-primary" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">View all conversations</div>
                        <div className="text-xs text-muted-foreground">{unreadMessages} new messages</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              )}

              {/* Alerts in Priority view */}
              {unreadAlerts > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Alerts</h3>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <Bell className="h-4 w-4 mr-3 text-accent" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">View all alerts</div>
                      <div className="text-xs text-muted-foreground">{unreadAlerts} new alerts</div>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          {unreadMessages === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Start by exploring verified listings and contacting sellers to begin conversations."
              actions={[
                { label: 'Explore Listings', href: '/explore' }
              ]}
            />
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-12" asChild>
                <Link href="/buyer/messages">
                  <MessageSquare className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">View all conversations</div>
                    <div className="text-xs text-muted-foreground">{unreadMessages} new messages</div>
                  </div>
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {unreadAlerts === 0 ? (
            <EmptyState
              icon={Bell}
              title="No alerts yet"
              description="Save searches and listings to get alerts about new properties and important updates."
              actions={[
                { label: 'Save a Search', href: '/buyer/saved-searches' }
              ]}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Alert items will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
