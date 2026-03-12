'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SavedSearch, Listing, Conversation } from '@/lib/types';
import { Search, Trash2, Heart, MessageSquare, Loader2, LandPlot, ArrowRight, Sparkles, Clock3, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
  const { user, userProfile } = useAuth();
  const [savedSearches, setSavedSearches] = useState(initialSearches);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onboardingSteps = [
    { label: 'Provision Identity Vault', completed: true, href: '/profile' },
    { label: 'Set Discovery Preferences', completed: !!userProfile?.preferences, href: '/buyer/onboarding' },
    { label: 'Verify Email Pulse', completed: userProfile?.verified || false, href: '/profile' },
    { label: 'Save First Property', completed: favoriteListings.length > 0, href: '/explore' },
  ];

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
    <div className="space-y-8 pb-24">
      {/* Discovery Protocol Checklist */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Discovery Protocol Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {onboardingSteps.map((step, idx) => (
              <Link key={idx} href={step.href} className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all",
                step.completed ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-background border-border/40 text-muted-foreground hover:border-accent/30"
              )}>
                {step.completed ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <Circle className="h-5 w-5 flex-shrink-0 opacity-20" />}
                <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{step.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary">
              <LandPlot className="h-3.5 w-3.5" /> Discovery Pulse
            </p>
            <h2 className="text-xl font-bold tracking-tight">Resume your search</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Jump back into the registry or check newly vaulted Gold-badge listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-11 px-6 font-bold uppercase text-[10px] tracking-widest shadow-glow">
              <Link href="/explore">Continue search</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 font-bold uppercase text-[10px] tracking-widest bg-background">
              <Link href="/explore?badges=TrustedSignal">New Gold Signal Listings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {/* Saved Searches */}
      <Card className="xl:col-span-2 border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-tight">Saved Registry Filters</CardTitle>
          <CardDescription className="text-xs font-medium">Revisit your custom criteria nodes for new verified assets.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map(search => (
                <div key={search.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 overflow-hidden">
                    <Link href={search.url} className="font-bold hover:text-accent truncate block text-sm">
                      {search.name}
                    </Link>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      Protocol Active: {formatDistanceToNow(search.createdAt.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="h-9 px-4 font-bold uppercase text-[9px] tracking-widest bg-background">
                      <Link href={search.url}><Search className="h-3.5 w-3.5 mr-2"/>Pulse</Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-risk hover:bg-risk-light" disabled={deletingId === search.id}>
                                {deletingId === search.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-black uppercase tracking-tight">Flush Search Protocol?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-medium">
                                This will permanently remove "{search.name}" from your saved searches.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="font-bold uppercase text-[10px]">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSearch(search.id)} className="bg-risk text-white font-bold uppercase text-[10px]">Delete Protocol</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/10">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-black uppercase tracking-tight">No Saved Filters</h3>
                <p className="mt-2 text-xs text-muted-foreground font-medium max-w-xs mx-auto">Use the refinement tools in the registry and click "Save Search" to track specific markets.</p>
                <Button asChild variant="outline" className="mt-6 h-10 font-bold uppercase text-[10px] tracking-widest">
                    <Link href="/explore">Browse Registry</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sidebar: Activity & Status */}
      <div className="space-y-8">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Heart className="h-4 w-4 text-risk" /> Favorited Vaults
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteListings.length > 0 ? (
                <div className="space-y-3">
                    {favoriteListings.map(listing => (
                        <Link key={listing.id} href={`/listings/${listing.id}`} className="flex items-center gap-3 p-2 rounded-xl border border-border/40 hover:border-accent/30 transition-all hover:bg-background group">
                            <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              <Image src={listing.images[0]?.url} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-xs truncate group-hover:text-accent transition-colors">{listing.title}</p>
                                <p className="text-[10px] text-muted-foreground truncate uppercase font-medium mt-0.5">{listing.location}</p>
                            </div>
                        </Link>
                    ))}
                    <Button asChild variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest mt-2">
                        <Link href="/favorites">View Full Favorites List <ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <Heart className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tight">No Vaulted Favorites</p>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" /> Active Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
             {recentConversations.length > 0 ? (
                 <div className="space-y-3">
                    {recentConversations.map(convo => (
                         <Link key={convo.id} href={`/messages/${convo.id}`} className="flex items-center gap-3 p-2 rounded-xl border border-border/40 hover:border-accent/30 transition-all hover:bg-background group">
                             <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                               <Image src={convo.listingImage} alt="" fill className="object-cover" />
                             </div>
                             <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-xs truncate group-hover:text-accent transition-colors">{convo.listingTitle}</p>
                                <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5 italic">
                                    {convo.lastMessage ? (
                                        <>
                                            {convo.lastMessage.senderId !== user?.uid ? 'Seller: ' : 'You: '}
                                            {convo.lastMessage.text}
                                        </>
                                    ): 'Pulse initiated...'}
                                </p>
                             </div>
                         </Link>
                    ))}
                     <Button asChild variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest mt-2">
                        <Link href="/messages">Enter Communication Hub <ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                 </div>
             ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tight">No Active Conversations</p>
                </div>
             )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2"><Clock3 className="h-4 w-4 text-muted-foreground" />Identity Trail</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <Link key={item.id} href={item.href} className="group block space-y-1">
                    <p className="text-[11px] font-bold text-foreground/80 group-hover:text-primary transition-colors leading-tight">{item.label}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{formatDistanceToNow(item.when, { addSuffix: true })}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">No recent pulses detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
