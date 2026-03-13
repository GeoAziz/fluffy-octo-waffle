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
import type { Conversation, Listing, UserProfile, Evidence } from '@/lib/types';
import { AlertTriangle, Eye, ListChecks, MessageSquareText, PlusCircle, FileText, ShieldCheck, Clock, Activity, Target, CheckCircle2, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { SellerPage } from '@/components/seller/seller-page';
import { SellerOnboardingWizard } from '@/components/seller/seller-onboarding-wizard';
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
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';

const statusStyles: Record<ReturnType<typeof getConversationStatus>, string> = {
  new: 'bg-warning/15 text-warning',
  responded: 'bg-success/15 text-success',
  closed: 'bg-muted text-muted-foreground',
};

/**
 * SellerDashboard - High-trust analytical command center for property owners.
 * Featuring the Signal Optimization Loop (P1 Recommendation).
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
  };

  const needsAttentionItems = listings.filter(l => l.status === 'rejected');

  // Badge upgrade path logic
  const getBadgeUpgradePath = (listing: Listing) => {
    const currentBadge = listing.badge;
    const listingEvidence = evidence.filter(e => e.listingId === listing.id);
    const hasTitleDeed = listingEvidence.some(e => e.type === 'title_deed');
    const hasSurveyMap = listingEvidence.some(e => e.type === 'survey_map');

    if (currentBadge === 'TrustedSignal') return null;
    if (currentBadge === 'EvidenceReviewed' && !hasSurveyMap) return { target: 'TrustedSignal', action: 'Upload Survey Map' };
    if (!hasTitleDeed) return { target: 'EvidenceReviewed', action: 'Upload Title Deed' };
    return null;
  };

  return (
    <SellerPage
      title="Workspace"
      description={`Welcome back${userProfile.displayName ? `, ${userProfile.displayName}` : ''}. Manage your registry nodes.`}
      actions={(
        <Button asChild className="shadow-glow font-bold uppercase text-[10px] tracking-widest h-11 px-6">
          <Link href="/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Provision Listing
          </Link>
        </Button>
      )}
    >
      {/* P1: Seller Onboarding / Wizard */}
      {listings.length === 0 && <SellerOnboardingWizard />}

      {/* Signal Optimization Loop */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {needsAttentionItems.length > 0 && (
          <Card className="border-risk/40 bg-risk-light/20 animate-shake">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-risk">
                <AlertTriangle className="h-4 w-4" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {needsAttentionItems.map((item) => (
                <div key={item.id} className="p-3 bg-background/80 border border-risk/20 rounded-xl space-y-2">
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground italic">Reason: "{item.rejectionReason}"</p>
                  <Button asChild size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase w-full">
                    <Link href={`/listings/${item.id}/edit`}>Re-submit node</Link>
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
                <div key={listing.id} className="p-3 bg-background/80 border border-accent/20 rounded-xl flex items-center justify-between">
                  <div className="overflow-hidden mr-4">
                    <p className="text-xs font-bold truncate">{listing.title}</p>
                    <p className="text-[9px] text-accent font-bold uppercase">{upgrade.action} to reach {upgrade.target}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="h-8 text-[9px] font-black uppercase shrink-0 text-accent hover:bg-accent/10">
                    <Link href={`/listings/${listing.id}/edit`}>Vault Proof</Link>
                  </Button>
                </div>
              );
            })}
            {listings.length > 0 && listings.every(l => l.badge === 'TrustedSignal') && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">All Nodes Optimized</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-none shadow-lg bg-primary text-white overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80">Property Vault</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{statusCounts.approved}</div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-1">Live Verified Assets</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-accent text-white overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80">Exposure Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalViews.toLocaleString()}</div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-1">Total Profile Views</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-background border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inquiry Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{inquiryRate}%</div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-1">View-to-Lead Ratio</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-background border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Evidence Integrity</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-foreground">{evidenceStats.verified} / {evidenceStats.total}</div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-1">Verified Proofs</p>
            </div>
            {evidenceStats.verified < evidenceStats.total && (
              <Badge variant="warning" className="h-5 text-[9px] font-black uppercase tracking-widest">PENDING</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" /> Active Registry
          </h2>

          <Card className="border-none shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {listings.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={ListChecks}
                    title="Vault is Empty"
                    description="You haven't added any properties to your registry vault yet."
                    actions={[{ label: 'Provision First Listing', href: '/listings/new', variant: 'accent' }]}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Listing Node</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Pulse</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Trust Signal</TableHead>
                        <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.slice(0, 5).map((listing) => (
                        <TableRow key={listing.id} className="hover:bg-muted/5 transition-all">
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
                            <div className="flex flex-col">
                              <span className="text-xs font-black">{listing.views || 0}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">Views</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {listing.badge ? (
                              <Badge className="text-[9px] font-black uppercase tracking-widest border-none px-2 h-5 bg-accent text-white">
                                {listing.badge}
                              </Badge>
                            ) : (
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Review Active</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
                              <Link href={`/listings/${listing.id}/edit`}>Edit</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-6">
              <MessageSquareText className="h-5 w-5 text-primary" /> Recent Inquiries
            </h2>
            <div className="space-y-4">
              {recentConversations.length === 0 ? (
                <div className="p-6 rounded-xl border-2 border-dashed text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">
                    No active buyer signals yet. Verified listings attract more inquiries.
                  </p>
                </div>
              ) : (
                recentConversations.map((convo) => {
                  const status = getConversationStatus(convo, user.uid);
                  const updatedAt = convo.updatedAt?.toDate?.() ?? new Date();

                  return (
                    <Link
                      key={convo.id}
                      href={`/messages/${convo.id}`}
                      className="block rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 group"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{convo.listingTitle}</p>
                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest", statusStyles[status])}>
                          {conversationStatusLabel[status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        <span>{convo.participants[Object.keys(convo.participants).find(id => id !== user.uid) || '']?.displayName}</span>
                        <span>{formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
                      </div>
                    </Link>
                  );
                })
              )}
              <Button asChild variant="outline" className="w-full h-11 font-black uppercase text-[10px] tracking-widest">
                <Link href="/messages">Open Communication Hub</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SellerPage>
  );
}
