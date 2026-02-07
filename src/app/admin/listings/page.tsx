'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Search, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrustBadge } from '@/components/trust-badge';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Listing, ListingStatus } from '@/lib/types';
import { searchListingsAction } from '../../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebouncedCallback } from 'use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { AdminPage } from '../_components/admin-page';
import { StatusBadge } from '@/components/status-badge';


export default function AdminListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Filter and sort state derived from URL
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt:desc';
  
  // Fetch listings whenever search params change
  useEffect(() => {
    setIsLoading(true);
    setSelectedIds([]); // Reset selection on data change
    const params = {
      query: query || undefined,
      status: status as ListingStatus | 'all',
      sortBy: sortBy,
      limit: 50, // Fetch more for admin view
    };
    searchListingsAction(params).then(result => {
      setListings(result.listings);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    })

  }, [searchParams, query, status, sortBy]);

  const handleUrlUpdate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    handleUrlUpdate('query', value);
  }, 500);

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
        setSelectedIds(listings.map(l => l.id));
    } else {
        setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | string) => {
      setSelectedIds(prev => 
          checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
      );
  };

    const handleBulkUpdate = async (newStatus: ListingStatus) => {
      if (selectedIds.length === 0) return;
      setIsBulkUpdating(true);
      try {
        const resp = await fetch('/api/admin/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingIds: selectedIds, status: newStatus }),
        });

        const data = await resp.json();
        if (!resp.ok || data.status !== 'success') {
          throw new Error(data.message || 'Bulk update failed');
        }

        toast({
          title: "Bulk Update Successful",
          description: `${selectedIds.length} listing(s) updated to "${newStatus}".`
        });
        
        // Refresh data by re-fetching. This is a simple way to reflect changes.
        // A more advanced implementation might update the state directly.
        router.refresh();

        // Reset selection
        setSelectedIds([]);

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Bulk Update Failed',
          description: error.message,
        });
      } finally {
        setIsBulkUpdating(false);
      }
    };

  const numSelected = selectedIds.length;
  const rowCount = listings.length;

  return (
    <AdminPage
      title="Manage Listings"
      description="Review, approve, and manage all property listings on the platform."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/listings', label: 'Listings' }]}
    >
      <Card>
        <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="relative flex-1 md:grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by title, location, seller..." 
                    className="pl-9 w-full md:w-[300px] lg:w-[400px]"
                    defaultValue={query}
                    onChange={(e) => debouncedSearch(e.target.value)}
                   />
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                  {numSelected > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto" disabled={isBulkUpdating}>
                          {isBulkUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Actions ({numSelected})
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkUpdate('approved')}>
                          Approve selected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkUpdate('rejected')}>
                          Reject selected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkUpdate('pending')}>
                          Set as pending
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Tabs value={status} onValueChange={(value) => handleUrlUpdate('status', value === 'all' ? '' : value)}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="approved">Approved</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                  </Tabs>
                   <Select value={sortBy} onValueChange={(value) => handleUrlUpdate('sortBy', value)}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt:desc">Newest First</SelectItem>
                        <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                        <SelectItem value="price:desc">Price: High to Low</SelectItem>
                        <SelectItem value="price:asc">Price: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                        onCheckedChange={handleSelectAll}
                        checked={numSelected === rowCount && rowCount > 0}
                        aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="hidden sm:table-cell">Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">AI Badge</TableHead>
                  <TableHead>Assigned Badge</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 8}).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                        <TableCell><Skeleton className="h-5 w-5"/></TableCell>
                        <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24"/></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20 rounded-full"/></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto"/></TableCell>
                    </TableRow>
                  ))
                ) : listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No listings found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
                  <TableRow key={listing.id} data-state={selectedIds.includes(listing.id) ? "selected" : undefined}>
                    <TableCell>
                        <Checkbox
                            onCheckedChange={(checked) => handleSelectOne(listing.id, !!checked)}
                            checked={selectedIds.includes(listing.id)}
                            aria-label={`Select listing ${listing.title}`}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{listing.title}</span>
                          <span className="text-xs text-muted-foreground">{listing.location}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{listing.seller.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={listing.status} />
                    </TableCell>
                     <TableCell className="hidden md:table-cell">
                      {listing.badgeSuggestion ? (
                        <TrustBadge badge={listing.badgeSuggestion.badge} />
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                       {listing.badge ? (
                        <TrustBadge badge={listing.badge} />
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/listings/${listing.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  );
}
