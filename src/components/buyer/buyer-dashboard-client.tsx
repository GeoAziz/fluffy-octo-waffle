'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SavedSearch, Listing, Conversation } from '@/lib/types';
import { Search, Trash2, Heart, MessageSquare, Loader2, LandPlot, ArrowRight, Sparkles, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { deleteSearchAction } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
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
import Image from 'next/image';
import { useAuth } from '@/components/providers';

interface BuyerDashboardClientProps {
  savedSearches: SavedSearch[];
  favoriteListings: Listing[];
  recentConversations: Conversation[];
}

export function BuyerDashboardClient({
  savedSearches: initialSearches,
  favoriteListings,
  recentConversations,
}: BuyerDashboardClientProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState(initialSearches);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  const recentActivity = useMemo(() => {
    const items: { id: string; label: string; when: Date; href: string }[] = [];

    savedSearches.slice(0, 2).forEach((search) => {
      items.push({
        id: `search-${search.id}`,
        label: `Updated saved search: ${search.name}`,
        when: search.createdAt.toDate(),
        href: search.url,
      });
    });

    recentConversations.slice(0, 3).forEach((conversation) => {
      const ts = conversation.lastMessage?.timestamp?.toDate?.();
      if (!ts) return;
      items.push({
        id: `conversation-${conversation.id}`,
        label: `Messaged about ${conversation.listingTitle}`,
        when: ts,
        href: `/messages/${conversation.id}`,
      });
    });

    favoriteListings.slice(0, 2).forEach((listing) => {
      items.push({
        id: `favorite-${listing.id}`,
        label: `Saved listing: ${listing.title}`,
        when: new Date(listing.createdAt),
        href: `/listings/${listing.id}`,
      });
    });

    return items.sort((a, b) => b.when.getTime() - a.when.getTime()).slice(0, 6);
  }, [favoriteListings, recentConversations, savedSearches]);

  const handleDeleteSearch = async (searchId: string) => {
    setDeletingId(searchId);
    try {
      await deleteSearchAction(searchId);
      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      toast({
        title: 'Search Deleted',
        description: 'Your saved search has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the saved search.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Primary action
            </p>
            <h2 className="text-xl font-semibold">Continue your search</h2>
            <p className="text-sm text-muted-foreground">
              Jump back into discovery or check newly verified listings that match your goals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/listings">Continue search</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/listings?badges=Gold">New verified listings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {/* Saved Searches */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>My Saved Searches</CardTitle>
          <CardDescription>Revisit your custom searches for new listings.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map(search => (
                <div key={search.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-secondary/30">
                  <div className="flex-1 overflow-hidden">
                    <Link href={search.url} className="font-semibold hover:underline truncate block">
                      {search.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Saved {formatDistanceToNow(search.createdAt.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={search.url}><Search className="h-4 w-4 mr-2"/>View</Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive" disabled={deletingId === search.id}>
                                {deletingId === search.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete your saved search &quot;{search.name}&quot;.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSearch(search.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Saved Searches Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Use the filters on the listings page and click &quot;Save Search&quot;.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Browse Listings</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorites, Messages, and Activity */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Favorite Properties</CardTitle>
            <CardDescription>Your recently saved listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteListings.length > 0 ? (
                <div className="space-y-3">
                    {favoriteListings.map(listing => (
                        <Link key={listing.id} href={`/listings/${listing.id}`} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50">
                            <Image src={listing.images[0]?.url} alt={listing.title} width={64} height={64} className="h-16 w-16 rounded-md object-cover bg-muted" />
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{listing.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{listing.location}</p>
                            </div>
                        </Link>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/favorites">View All Favorites</Link>
                    </Button>
                </div>
            ) : (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                    <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">You haven&apos;t favorited any listings yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Your latest conversations with sellers.</CardDescription>
          </CardHeader>
          <CardContent>
             {recentConversations.length > 0 ? (
                 <div className="space-y-3">
                    {recentConversations.map(convo => (
                         <Link key={convo.id} href={`/messages/${convo.id}`} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50">
                             <Image src={convo.listingImage} alt={convo.listingTitle} width={64} height={64} className="h-16 w-16 rounded-md object-cover bg-muted" />
                             <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{convo.listingTitle}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {convo.lastMessage ? (
                                        <>
                                            {convo.lastMessage.senderId !== user?.uid ? 'Seller: ' : 'You: '}
                                            {convo.lastMessage.text}
                                        </>
                                    ): 'No messages yet'}
                                </p>
                             </div>
                         </Link>
                    ))}
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/messages">View All Messages</Link>
                    </Button>
                 </div>
             ) : (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                    <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">You have no messages.</p>
                </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Recent Activity</CardTitle>
            <CardDescription>Track what you viewed, saved, and messaged recently.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <Link key={item.id} href={item.href} className="group flex items-start justify-between gap-3 rounded-md border p-3 hover:bg-muted/40">
                    <div>
                      <p className="text-sm font-medium group-hover:underline">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(item.when, { addSuffix: true })}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
