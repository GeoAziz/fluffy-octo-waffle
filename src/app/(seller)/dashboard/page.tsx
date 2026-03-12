import Link from 'next/link';
import { adminDb } from '@/lib/firebase-admin';
import { getPlatformSettings } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';
import type { Conversation, Listing, UserProfile, Evidence, BadgeValue } from '@/lib/types';
import { AlertTriangle, Eye, ListChecks, MessageSquareText, PlusCircle, FileText, ShieldCheck, Clock, Activity, Target, CheckCircle2, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { SellerPage } from '@/components/seller/seller-page';
import { getConversationStatus, conversationStatusLabel } from '@/lib/conversation-status';
import { getAuthenticatedUser } from './_lib/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';

const statusStyles: Record<ReturnType<typeof getConversationStatus>, string> = {
  new: 'bg-warning/15 text-warning',
  responded: 'bg-success/15 text-success',
  closed: 'bg-muted text-muted-foreground',
};

/**
 * SellerDashboard - High-trust analytical command center for property owners.
 * Features specialized Evidence Feedback loops and signal optimization paths.
 */
export default async function SellerDashboard() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const [listingsSnapshot, settings, evidenceSnapshot, recentConversationsSnapshot, userProfileDoc] = await Promise.all([
    adminDb.collection("listings").where("ownerId", "==", user.uid).orderBy('createdAt', 'desc').get(),
    getPlatformSettings(),
    adminDb.collection("evidence").where("ownerId", "==", user.uid).get(),
    adminDb.collection('conversations').where('participantIds', 'array-contains', user.uid).orderBy('updatedAt', 'desc').limit(3).get(),
    adminDb.collection('users').doc(user.uid).get()
  ]);
  
  const listings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[];
  const userProfile = userProfileDoc.data() as UserProfile;
  const evidence = evidenceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Evidence[];
  const recentConversations = recentConversationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Conversation[];

  const statusCounts = listings.reduce(
    (acc, listing) => {
      acc.total += 1;
      acc[listing.status] += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);
  const inquiryRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0";

  const evidenceStats = {
    pending: evidence.filter(e => !e.verified).length,
    verified: evidence.filter(e => e.verified).length,
    total: evidence.length,
    types: Array.from(new Set(evidence.map(e => e.type)))
  };

  const needsAttentionItems = listings.filter(l => l.status === 'rejected');

  // Badge upgrade logic (Strategic Enhancement)
  const getBadgeUpgradePath = (listing: Listing) => {
    const currentBadge = listing.badge;
    const listingEvidence = evidence.filter(e => e.listingId === listing.id);
    const hasTitleDeed = listingEvidence.some(e => e.type === 'title_deed');
    const hasSurveyMap = listingEvidence.some(e => e.type === 'survey_map');
    const hasID = listingEvidence.some(e => e.type === 'id_document');

    if (currentBadge === 'TrustedSignal') return null;
    
    if (currentBadge === 'EvidenceReviewed') {
      if (!hasID) return { target: 'TrustedSignal', missing: 'Identity Proof (ID/PIN)', action: 'Upload ID document to reach Gold tier.' };
      if (!hasSurveyMap) return { target: 'TrustedSignal', missing: 'Certified Survey Map', action: 'Add a survey map to optimize signal.' };
    }

    if (currentBadge === 'EvidenceSubmitted' || !currentBadge) {
      if (!hasTitleDeed) return { target: 'EvidenceReviewed', missing: 'Primary Title Deed', action: 'Vault your title deed to start review.' };
    }

    return null;
  };

  return (
    <SellerPage
      title="Dashboard"
      description={`Welcome back${userProfile.displayName ? `, ${userProfile.displayName}` : ''}. Review your property vault status below.`}
      actions={(
        <Button asChild className="shadow-glow font-bold uppercase text-[10px] tracking-widest h-11 px-6">
          <Link href="/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Listing
          </Link>
        </Button>
      )}
    >

      {/* Strategic Enhancement: Signal Optimization Loop */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {needsAttentionItems.length > 0 && (
          <Card className="border-warning/40 bg-warning/5 animate-shake-error">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-warning">
                <AlertTriangle className="h-4 w-4" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsAttentionItems.map((item) => (
                <div key={item.id} className="p-3 bg-background/80 border border-warning/20 rounded-xl space-y-2">
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">Admin: "{item.rejectionReason}"</p>
                  <Button asChild size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase w-full">
                    <Link href={`/listings/${item.id}/edit`}>Re-Vault Listing</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-accent">
              <Sparkles className="h-4 w-4" />
              Signal Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listings.filter(l => l.status === 'approved' && l.badge !== 'TrustedSignal').slice(0, 2).map(listing => {
              const upgrade = getBadgeUpgradePath(listing);
              if (!upgrade) return null;
              return (
                <div key={listing.id} className="p-3 bg-background/80 border border-accent/20 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold truncate max-w-[150px]">{listing.title}</p>
                    <Badge variant="outline" className="text-[8px] h-4">Goal: {upgrade.target}</Badge>
                  </div>
                  <p className="text-[10px] text-accent font-bold uppercase">{upgrade.action}</p>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase w-full text-accent hover:bg-accent/10">
                    <Link href={`/listings/${listing.id}/edit`}>Optimize Vault</Link>
                  </Button>
                </div>
              );
            })}
            {listings.every(l => l.badge === 'TrustedSignal') && listings.length > 0 && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">All Nodes Optimized</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust & Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-none shadow-lg bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
              <ShieldCheck className="h-3 w-3" /> Property Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{statusCounts.approved}</div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-1">Live Verified Assets</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-accent text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
              <Activity className="h-3 w-3" /> Exposure Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalViews.toLocaleString()}</div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-1">Total Profile Views</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-background overflow-hidden relative border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Target className="h-3 w-3 text-emerald-500" /> Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{inquiryRate}%</div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-1">Inquiry Lead Rate</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-background overflow-hidden relative border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <FileText className="h-3 w-3 text-accent" /> Evidence Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-foreground">{evidenceStats.verified} / {evidenceStats.total}</div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-1">Verified Documents</p>
            </div>
            {evidenceStats.pending > 0 && (
              <Badge variant="warning" className="h-5 text-[9px] font-black uppercase tracking-tighter">
                <Clock className="mr-1 h-2.5 w-2.5" /> PENDING
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Listings Registry */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" /> Active Registry
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              <Link href="/dashboard/listings">View Full Archive</Link>
            </Button>
          </div>

          <Card className="border-none shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {listings.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={ListChecks}
                    title="Vault is Empty"
                    description="You haven't added any properties to your vault yet. Start listing to build buyer trust."
                    actions={[{ label: 'Create First Listing', href: '/listings/new', variant: 'accent' }]}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Listing</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Performance</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Trust Signal</TableHead>
                        <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.slice(0, 5).map((listing) => (
                        <TableRow key={listing.id} className="hover:bg-muted/5 transition-all duration-200">
                          <TableCell className="pl-6 py-4">
                            <div className="min-w-[200px]">
                              <Link href={`/listings/${listing.id}`} className="block text-sm font-bold hover:text-accent transition-colors">
                                {listing.title}
                              </Link>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                {listing.location} • KES {listing.price.toLocaleString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-black">{listing.views || 0}</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Views</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black">{listing.inquiryCount || 0}</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Leads</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {listing.badge ? (
                              <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest border-none px-2 h-5",
                                listing.badge === 'TrustedSignal' ? "bg-emerald-500 text-white" : "bg-accent text-white"
                              )}>
                                {listing.badge}
                              </Badge>
                            ) : (
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Awaiting Review</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
                                <Link href={`/listings/${listing.id}`}>View</Link>
                              </Button>
                              <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
                                <Link href={`/listings/${listing.id}/edit`}>Edit</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Verification Pulse */}
          {evidence.length > 0 && (
            <div className="mt-10 space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Verification Pulse
              </h2>
              <Card className="border-none shadow-xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Document</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Listing Node</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Sync Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evidence.slice(0, 5).map((doc) => {
                        const parentListing = listings.find(l => l.id === doc.listingId);
                        return (
                          <TableRow key={doc.id} className="hover:bg-muted/5 transition-all duration-200">
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-accent" />
                                <span className="text-xs font-bold truncate max-w-[150px]">{doc.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase truncate max-w-[150px] block">
                                {parentListing?.title || 'Unknown Resource'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {doc.verified ? (
                                <Badge className="bg-emerald-500 text-white border-none h-5 text-[9px] font-black uppercase tracking-widest">
                                  <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> VERIFIED
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="h-5 text-[9px] font-black uppercase tracking-widest">
                                  <Clock className="mr-1 h-2.5 w-2.5" /> REVIEWING
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                {formatDistanceToNow(doc.uploadedAt?.toDate?.() ?? new Date(), { addSuffix: true })}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Interactions */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-6">
              <MessageSquareText className="h-5 w-5 text-primary" /> Active Inquiries
            </h2>
            <div className="space-y-4">
              {recentConversations.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">
                      No active buyer signals yet. Verified listings attract more messages.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                recentConversations.map((convo) => {
                  const status = getConversationStatus(convo, user.uid);
                  const updatedAt = convo.updatedAt?.toDate?.() ?? new Date();
                  const needsAction = convo.lastMessage?.senderId !== user.uid && status !== 'closed';

                  return (
                    <Link
                      key={convo.id}
                      href={`/messages/${convo.id}`}
                      className={cn(
                        "block rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 group relative overflow-hidden",
                        needsAction && "border-risk/30 bg-risk-light/30"
                      )}
                    >
                      {needsAction && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-risk" />
                      )}
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{convo.listingTitle}</p>
                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest", statusStyles[status])}>
                          {conversationStatusLabel[status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        <span className={cn(needsAction && "text-risk font-black")}>
                          {needsAction ? 'AWAITING REPLY' : convo.participants[Object.keys(convo.participants).find(id => id !== user.uid) || '']?.displayName}
                        </span>
                        <span>{formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
                      </div>
                    </Link>
                  );
                })
              )}
              <Button asChild variant="outline" className="w-full h-11 font-black uppercase text-[10px] tracking-widest">
                <Link href="/messages">Enter Communication Hub</Link>
              </Button>
            </div>
          </div>

          <Card className="border-none bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Verification SLA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                Our trust team typically completes document verification within <strong className="text-accent">{settings.moderationThresholdDays || 2} business days</strong>. Ensure your phone notifications are active for urgent clarification requests.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerPage>
  );
}
