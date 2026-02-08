'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Mail, AlertTriangle, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminPage } from '../_components/admin-page';
import { ContactMessageActions, ListingReportActions } from '../_components/inbox-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { getInboxItemsAction } from '@/app/actions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type InboxItemStatus = 'new' | 'handled' | 'all';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'handled';
  createdAt?: string | null;
};

type ListingReport = {
  id: string;
  listingId: string;
  reason: string;
  reporter?: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
  } | null;
  status: 'new' | 'handled';
  createdAt?: string | null;
};


export default function AdminInboxPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [listingReports, setListingReports] = useState<ListingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mainTab = searchParams.get('tab') || 'messages';
  const contactStatus = (searchParams.get('contact') as InboxItemStatus) || 'new';
  const reportStatus = (searchParams.get('report') as InboxItemStatus) || 'new';

  useEffect(() => {
    setIsLoading(true);
    getInboxItemsAction({
      contactStatus: contactStatus,
      reportStatus: reportStatus,
    }).then(data => {
      setContactMessages(data.contactMessages);
      setListingReports(data.listingReports);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [contactStatus, reportStatus]);

  const handleFilterChange = (type: 'contact' | 'report', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleTabChange = (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', value);
      router.push(`${pathname}?${params.toString()}`);
  }

  const FilterTabs = ({ type, value }: { type: 'contact' | 'report', value: string }) => (
    <Tabs value={value} onValueChange={(v) => handleFilterChange(type, v)} className="mb-4">
        <TabsList>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="handled">Handled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
    </Tabs>
  );

  const MessagesContent = () => {
    if (isLoading) return <InboxSkeleton />;
    if (contactMessages.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No contact messages match the current filter.</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {contactMessages.map((message) => (
                <Card key={message.id} className="flex flex-col border-l-4 border-l-blue-500 overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-blue-50/50">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-lg truncate">{message.name}</CardTitle>
                                    <CardDescription className="truncate">{message.email}</CardDescription>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <Badge variant={message.status === 'new' ? 'destructive' : 'outline'} className="mb-1">
                                    {message.status === 'new' ? 'Unread' : 'Read'}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                        <p className="text-sm text-foreground/80 line-clamp-3">{message.message}</p>
                    </CardContent>
                    <CardFooter className="flex items-center gap-2 pt-4 border-t">
                        <ContactMessageActions messageId={message.id} currentStatus={message.status} />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
  };

  const ReportsContent = () => {
      if (isLoading) return <InboxSkeleton />;
      if (listingReports.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No listing reports match the current filter.</p>
            </div>
        );
      }
      return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listingReports.map((report) => (
            <Card key={report.id} className="flex flex-col border-l-4 border-l-red-500 overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-red-50/50">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg">Report Against Listing</CardTitle>
                                <CardDescription className="font-mono text-sm">ID: {report.listingId}</CardDescription>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <Badge variant={report.status === 'new' ? 'destructive' : 'outline'} className="mb-1">
                                {report.status === 'new' ? 'Pending' : 'Resolved'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                                {report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 pt-4">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">REPORTED BY</p>
                        <p className="text-sm">{report.reporter?.displayName || 'Anonymous'}</p>
                        {report.reporter?.email && <p className="text-xs text-muted-foreground">{report.reporter.email}</p>}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">REASON FOR REPORT</p>
                        <p className="text-sm text-foreground/80 line-clamp-3 bg-secondary/30 p-2 rounded border border-secondary">{report.reason}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center gap-2 pt-4 border-t">
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/listings/${report.listingId}`} className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4"/>
                            View Listing
                        </Link>
                    </Button>
                    <ListingReportActions reportId={report.id} currentStatus={report.status} />
                </CardFooter>
            </Card>
            ))}
        </div>
      );
  }

  return (
    <AdminPage
      title="Inbox"
      description="Review user messages and listing reports."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/inbox', label: 'Inbox' }]}
    >
        <Tabs value={mainTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="messages">Contact Messages</TabsTrigger>
                <TabsTrigger value="reports">Listing Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="messages">
                <FilterTabs type="contact" value={contactStatus} />
                <MessagesContent />
            </TabsContent>
            <TabsContent value="reports">
                <FilterTabs type="report" value={reportStatus} />
                <ReportsContent />
            </TabsContent>
      </Tabs>
    </AdminPage>
  );
}

const InboxSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({length: 2}).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right flex-shrink-0 space-y-2">
                            <Skeleton className="h-5 w-16 ml-auto" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </CardFooter>
            </Card>
        ))}
    </div>
);

    
