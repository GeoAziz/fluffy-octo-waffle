"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "../_components/admin-page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ChevronRight, Check, X, LandPlot, AlertTriangle, ArrowUpDown, Clock, User, MapPin } from "lucide-react";
import { searchListingsAction, bulkUpdateListingStatus } from "@/app/actions";
import type { Listing } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { EmptyState } from "@/components/empty-state";
import Image from "next/image";
import { TrustBadge } from "@/components/trust-badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SortField = 'createdAt' | 'price' | 'aiRiskScore';
type SortOrder = 'asc' | 'desc';

export default function AdminListingsPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "Gold" | "Silver" | "Bronze" | "None">('all');
  const [dateRange, setDateRange] = useState<'all' | '7' | '30' | '90'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const pageSize = 15;

  const fetchListings = async (opts: { append?: boolean; startAfter?: string | null } = {}) => {
    setLoading(true);
    try {
      const res = await searchListingsAction({
        query: debouncedQuery || undefined,
        status: statusFilter as any,
        badges: badgeFilter === 'all' || badgeFilter === 'None' ? undefined : [badgeFilter as any],
        limit: pageSize,
        startAfter: opts.startAfter || undefined,
        sortBy: `${sortField}:${sortOrder}`,
      });

      const rangeDays = dateRange === 'all' ? null : Number(dateRange);
      const filtered = rangeDays
        ? res.listings.filter((listing) => {
            const refDate = listing.adminReviewedAt?.toDate?.() ?? listing.updatedAt?.toDate?.() ?? listing.createdAt?.toDate?.();
            if (!refDate) return false;
            const ageDays = (Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24);
            return ageDays <= rangeDays;
          })
        : res.listings;

      if (opts.append) {
        setListings((s) => [...s, ...filtered]);
      } else {
        setListings(filtered);
      }

      setLastVisibleId(res.lastVisibleId);
      setHasMore(Boolean(res.lastVisibleId));
    } catch (e) {
      console.error('Error fetching listings:', e);
      toast({
        variant: 'destructive',
        title: 'Query Failed',
        description: 'Check admin permissions or connectivity.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    setSelected({});
    setLastVisibleId(null);
    fetchListings({ append: false });
  }, [debouncedQuery, statusFilter, badgeFilter, dateRange, sortField, sortOrder]);

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectAllOnPage = () => {
    const newMap: Record<string, boolean> = {};
    listings.forEach((l) => (newMap[l.id] = true));
    setSelected(newMap);
  };

  const clearSelection = () => setSelected({});

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("pending");
    setBadgeFilter("all");
    setDateRange("all");
    setSortField('createdAt');
    setSortOrder('desc');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleBulk = async (status: "approved" | "rejected" | "pending") => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateListingStatus(selectedIds, status as any);
      toast({
        variant: 'success',
        title: 'Bulk Action Complete',
        description: `${selectedIds.length} properties marked as ${status}.`,
      });
      setSelected({});
      setLastVisibleId(null);
      await fetchListings({ append: false });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Bulk Update Failed',
        description: 'Check admin permissions or connectivity.',
      });
    }
  };

  return (
    <AdminPage
      title="Moderation Queue"
      description="Review pending listings, triage suspicious uploads, and assign trust signals."
      breadcrumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/listings", label: "Listings" }]}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-6 items-end">
        <div className="lg:col-span-2 space-y-2">
          <Label htmlFor="listing-search" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search Records</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="listing-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, Location, or Seller..."
              className="pl-9 h-11"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
          <select
            id="status-filter"
            className="w-full h-11 rounded-md border px-3 py-2 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Records</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge-filter" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trust Tier</Label>
          <select
            id="badge-filter"
            className="w-full h-11 rounded-md border px-3 py-2 text-sm bg-background"
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value as any)}
          >
            <option value="all">Any Tier</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
            <option value="None">No Badge</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recency</Label>
          <select
            id="date-filter"
            className="w-full h-11 rounded-md border px-3 py-2 text-sm bg-background"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="all">Lifetime</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-11" onClick={resetFilters}>Reset</Button>
        </div>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-black tracking-tight uppercase">Listings Registry</CardTitle>
              {statusFilter === 'pending' && listings.length > 0 && (
                <Badge className="bg-warning text-warning-foreground border-none px-2 h-5 font-black text-[10px] tracking-widest">
                  ACTION REQUIRED
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-right-2">
                  <span className="text-xs font-bold text-accent">{selectedIds.length} Selected</span>
                  <div className="flex gap-1">
                    <ConfirmActionDialog
                      title="Bulk Approve"
                      description={`You are about to approve ${selectedIds.length} listings. This will make them publicly visible with their assigned trust signals.`}
                      confirmLabel="Confirm Approval"
                      onConfirm={() => handleBulk("approved")}
                    >
                      <Button size="sm" className="h-8 bg-success text-white hover:bg-success/90">
                        <Check className="h-3 w-3 mr-1" /> Approve
                      </Button>
                    </ConfirmActionDialog>
                    <ConfirmActionDialog
                      title="Bulk Reject"
                      description={`You are about to reject ${selectedIds.length} listings. Sellers will be notified to correct their documentation.`}
                      confirmLabel="Confirm Rejection"
                      onConfirm={() => handleBulk("rejected")}
                      variant="destructive"
                    >
                      <Button size="sm" variant="destructive" className="h-8">
                        <X className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </ConfirmActionDialog>
                  </div>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">Batch Tools</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={selectAllOnPage}>Select Page</DropdownMenuItem>
                  <DropdownMenuItem onClick={clearSelection} disabled={selectedIds.length === 0}>Clear Selection</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && listings.length === 0 ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="p-20">
              <EmptyState
                icon={Search}
                title="Queue Empty"
                description="No listings match your current filters. Great work on the backlog!"
                actions={[{ label: 'View Pending Only', variant: 'accent', onClick: () => setStatusFilter('pending') }]}
              />
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-[40px] pl-4">
                        <Checkbox
                          checked={listings.length > 0 && selectedIds.length === listings.length}
                          onCheckedChange={(checked) => checked ? selectAllOnPage() : clearSelection()}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer group" onClick={() => handleSort('aiRiskScore')}>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                          Risk / Priority
                          <ArrowUpDown className={cn("h-3 w-3 transition-opacity", sortField === 'aiRiskScore' ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                        </div>
                      </TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Listing Asset</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Trust Signal</TableHead>
                      <TableHead className="cursor-pointer group" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                          Submitted
                          <ArrowUpDown className={cn("h-3 w-3 transition-opacity", sortField === 'createdAt' ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-4 text-[10px] font-black uppercase tracking-widest">Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing, index) => (
                      <TableRow 
                        key={listing.id} 
                        className={cn("hover:bg-muted/5 transition-colors animate-in fade-in slide-in-from-left-4 fill-mode-backwards", !!selected[listing.id] && "bg-accent/5")}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={!!selected[listing.id]}
                            onCheckedChange={() => toggleSelect(listing.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {listing.aiRiskScore >= 70 ? (
                              <div className="flex items-center gap-1.5 rounded-full bg-risk-light px-2 py-0.5 border border-risk/20">
                                <AlertTriangle className="h-3 w-3 text-risk" />
                                <span className="text-[10px] font-black text-risk uppercase tracking-tighter">High Risk ({listing.aiRiskScore}%)</span>
                              </div>
                            ) : listing.aiRiskScore >= 30 ? (
                              <div className="flex items-center gap-1.5 rounded-full bg-warning-light px-2 py-0.5 border border-warning/20">
                                <Clock className="h-3 w-3 text-warning" />
                                <span className="text-[10px] font-black text-warning uppercase tracking-tighter">Medium ({listing.aiRiskScore}%)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 border border-success/20">
                                <Check className="h-3 w-3 text-success" />
                                <span className="text-[10px] font-black text-success uppercase tracking-tighter">Low ({listing.aiRiskScore}%)</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-[280px]">
                            <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                              {listing.images?.[0]?.url ? (
                                <Image
                                  src={listing.images[0].url}
                                  alt=""
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <LandPlot className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/admin/listings/${listing.id}`} className="block truncate text-sm font-bold hover:text-accent transition-colors">
                                {listing.title}
                              </Link>
                              <p className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                {listing.location} — {listing.county}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {listing.badge && listing.badge !== 'None' ? (
                            <TrustBadge badge={listing.badge} showTooltip={false} className="h-5" />
                          ) : (
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">None Assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">
                              {listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">By {listing.seller.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button asChild size="sm" variant="ghost" className="h-11 w-11 p-0 hover:bg-accent/10 hover:text-accent">
                            <Link href={`/admin/listings/${listing.id}`}>
                              <ChevronRight className="h-5 w-5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden p-4 space-y-4">
                {listings.map((listing, index) => (
                  <Card 
                    key={listing.id} 
                    className={cn("border-border/60 transition-all animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards", !!selected[listing.id] && "ring-2 ring-primary bg-primary/5")}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <Checkbox
                          checked={!!selected[listing.id]}
                          onCheckedChange={() => toggleSelect(listing.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className={cn(
                              "text-[9px] font-black uppercase tracking-tighter",
                              listing.aiRiskScore >= 70 ? "text-risk border-risk/20 bg-risk-light" : listing.aiRiskScore >= 30 ? "text-warning border-warning/20 bg-warning-light" : "text-success border-success/20 bg-success/5"
                            )}>
                              Risk: {listing.aiRiskScore}%
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-bold">
                              {listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted border">
                              {listing.images?.[0]?.url ? (
                                <Image src={listing.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                              ) : (
                                <LandPlot className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground/20" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link href={`/admin/listings/${listing.id}`} className="block truncate text-base font-black hover:text-accent transition-colors">
                                {listing.title}
                              </Link>
                              <p className="truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {listing.location}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase truncate">{listing.seller.name}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-muted-foreground">Signal:</span>
                              <TrustBadge badge={listing.badge} showTooltip={false} className="h-5" />
                            </div>
                            <Button asChild size="sm" className="h-9 font-bold px-4">
                              <Link href={`/admin/listings/${listing.id}`}>Review</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {hasMore && (
            <div className="flex justify-center p-6 bg-muted/5 pb-safe">
              <Button 
                variant="outline"
                className="h-12 w-full lg:w-auto lg:px-10 font-black text-xs uppercase tracking-widest"
                onClick={() => fetchListings({ append: true, startAfter: lastVisibleId })}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More Assets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}