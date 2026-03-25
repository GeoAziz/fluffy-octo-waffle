import Link from 'next/link';
import { adminDb } from '@/lib/firebase-admin';
import { getListingsForSeller } from '@/lib/data';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelative, formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';
import type { ListingStatus, UserProfile } from '@/lib/types';
import { Edit, PlusCircle } from 'lucide-react';
import { SellerPage } from '@/components/seller/seller-page';
import { getAuthenticatedUser } from '../_lib/auth';
import { EmptyState } from '@/components/empty-state';
import { toDateSafe } from '@/lib/utils';

/**
 * SellerListingsPage - The seller's primary property registry.
 * Standardized empty state provides clear progression for new sellers.
 */
export default async function SellerListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const listings = await getListingsForSeller(user.uid);
  const userProfileDoc = await adminDb.collection('users').doc(user.uid).get();
  if (!userProfileDoc.exists) {
    redirect('/login');
  }
  const userProfile = userProfileDoc.data() as UserProfile;

  const params = (await searchParams) ?? {};
  const requestedStatus = params.status;
  const allowedStatuses: Array<ListingStatus | 'all'> = ['all', 'pending', 'approved', 'rejected'];
  const activeStatus = allowedStatuses.includes((requestedStatus as ListingStatus | 'all') ?? 'all')
    ? ((requestedStatus as ListingStatus | 'all') ?? 'all')
    : 'all';

  const listingCounts = listings.reduce(
    (acc, listing) => {
      acc.all += 1;
      acc[listing.status] += 1;
      return acc;
    },
    { all: 0, pending: 0, approved: 0, rejected: 0 }
  );

  const visibleListings = activeStatus === 'all'
    ? listings
    : listings.filter((listing) => listing.status === activeStatus);

  return (
    <SellerPage
      title="Registry"
      description={`Manage your vaulted properties, ${userProfile.displayName || 'Seller'}.`}
      actions={(
        <Button asChild className="font-bold uppercase text-[10px] tracking-widest h-11 px-6 shadow-glow">
          <Link href="/listings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Provision Node
          </Link>
        </Button>
      )}
    >
      <Card className="border-none shadow-xl bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-tight">Active Registry</CardTitle>
          <CardDescription className="text-xs font-medium">Review protocol status and market exposure metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Protocols' },
              { key: 'pending', label: 'Pending Review' },
              { key: 'approved', label: 'Verified Assets' },
              { key: 'rejected', label: 'Correction Required' },
            ].map((item) => {
              const isActive = activeStatus === item.key;
              const href = item.key === 'all' ? '/dashboard/listings' : `/dashboard/listings?status=${item.key}`;
              const count = listingCounts[item.key as keyof typeof listingCounts];
              return (
                <Button key={item.key} asChild size="sm" variant={isActive ? 'default' : 'outline'} className="h-9 font-bold uppercase text-[9px] tracking-widest">
                  <Link href={href}>{item.label} ({count})</Link>
                </Button>
              );
            })}
          </div>

          {visibleListings.length > 0 ? (
            <>
              <div className="grid gap-4 md:hidden">
                {visibleListings.map((listing) => (
                  <div key={listing.id} className="rounded-xl border border-border/40 p-4 space-y-3 bg-background/50">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/listings/${listing.id}`} className="font-black uppercase text-xs hover:text-accent transition-colors">
                        {listing.title}
                      </Link>
                      <StatusBadge status={listing.status} className="h-5 text-[8px]" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {listing.location} • KES {listing.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60">
                        Synced: {listing.createdAt ? formatRelative(toDateSafe(listing.createdAt) || new Date(), new Date()) : 'N/A'}
                      </p>
                      <Button asChild variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase px-4">
                        <Link href={`/listings/${listing.id}/edit`}>Modify Node</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Property Node</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Protocol Status</TableHead>
                      <TableHead className="hidden lg:table-cell text-[10px] font-black uppercase tracking-widest">Sync Time</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Handshake Value</TableHead>
                      <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleListings.map((listing) => (
                      <TableRow key={listing.id} className="hover:bg-muted/5">
                        <TableCell className="font-bold pl-6">
                          <Link href={`/listings/${listing.id}`} className="hover:text-accent transition-colors">
                            {listing.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={listing.status} className="h-5 text-[9px] font-black uppercase tracking-widest" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-[10px] font-medium text-muted-foreground uppercase">
                          {listing.createdAt ? formatDistanceToNow(toDateSafe(listing.createdAt) || new Date(), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-black text-sm">
                          KES {listing.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent">
                            <Link href={`/listings/${listing.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit Listing</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <EmptyState
              icon="Search"
              title={activeStatus === 'all' ? "Registry is Empty" : "No results for protocol"}
              description={activeStatus === 'all' 
                ? "You haven't provisioned any property nodes to the registry yet. Building a high-trust portfolio starts here."
                : `We couldn't find any property nodes currently in the ${activeStatus} triage state.`
              }
              actions={[
                { label: 'Provision New Listing', href: '/listings/new', variant: 'accent' },
                { label: 'Flush Filter Protocol', href: '/dashboard/listings', variant: 'outline' }
              ]}
            />
          )}
        </CardContent>
      </Card>
    </SellerPage>
  );
}
