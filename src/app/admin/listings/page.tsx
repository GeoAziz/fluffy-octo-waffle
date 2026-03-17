
"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "../_components/admin-page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowUpDown, CheckSquare, Square, ShieldCheck, ShieldAlert, RotateCcw } from "lucide-react";
import { searchListingsAction } from "@/app/actions";
import type { Listing, ListingStatus } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { ListingQueueItem } from "@/components/admin/risk-score-display";
import { StaggerContainer } from "@/components/animations/stagger-container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * AdminListingsPage - Hardened moderation registry with Bulk Action Protocol.
 * Supports multi-select triaging and AI risk score prioritization.
 */
export default function AdminListingsPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const fetchListings = async (opts: { append?: boolean; startAfter?: string | null } = {}) => {
    setLoading(true);
    try {
      const res = await searchListingsAction({
        query: debouncedQuery || undefined,
        status: statusFilter as any,
        limit: 15,
        startAfter: opts.startAfter || undefined,
      });

      if (opts.append) {
        setListings((s) => [...s, ...res.listings]);
      } else {
        setListings(res.listings);
        setSelectedIds(new Set()); // Reset selection on new search
      }

      setLastVisibleId(res.lastVisibleId);
      setHasMore(Boolean(res.lastVisibleId));
    } catch (e) {
      toast({ 
        variant: 'destructive', 
        title: 'Registry Query Failed', 
        description: 'Could not resolve the current listing stack.' 
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
    setLastVisibleId(null);
    fetchListings({ append: false });
  }, [debouncedQuery, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === listings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(listings.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkUpdate = async (status: ListingStatus) => {
    if (selectedIds.size === 0) return;
    
    setIsBulkUpdating(true);
    try {
      const response = await fetch('/api/admin/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingIds: Array.from(selectedIds),
          status
        }),
      });

      if (!response.ok) throw new Error('Bulk transmission failed');

      toast({
        title: 'Bulk Protocol Executed',
        description: `Successfully updated ${selectedIds.size} records to ${status}.`,
      });
      
      // Refresh local state
      fetchListings({ append: false });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Bulk Error',
        description: 'Execution failed. Check your clearance level.',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <AdminPage
      title="Moderation Registry"
      description="Triage vaulted properties and manage documentation integrity signals."
      breadcrumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/listings", label: "Listings" }]}
    >
      {/* Search & Filter Protocol Bar */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4 items-end bg-card/50 p-6 rounded-2xl border border-border/40 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="lg:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Registry ID or Title..."
              className="pl-9 h-12 bg-background font-bold"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Signal</Label>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="h-12 font-bold bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" className="font-bold">Pending Triage</SelectItem>
              <SelectItem value="approved" className="font-bold">Approved Assets</SelectItem>
              <SelectItem value="rejected" className="font-bold">Rejected Records</SelectItem>
              <SelectItem value="all" className="font-bold">Full Archive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="h-12 font-black uppercase text-[10px] tracking-widest" onClick={() => {setQuery(""); setStatusFilter("pending")}}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Flush Filters
        </Button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-6 flex items-center justify-between p-4 bg-primary text-white rounded-xl shadow-glow animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black uppercase tracking-widest">{selectedIds.size} Records Selected</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-white/70 hover:text-white text-[10px] uppercase font-bold">Clear Selection</Button>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleBulkUpdate('approved')}
              disabled={isBulkUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-[9px] tracking-widest px-4"
            >
              {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
              Approve Selected
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleBulkUpdate('rejected')}
              disabled={isBulkUpdating}
              className="bg-risk hover:bg-risk/90 font-black uppercase text-[9px] tracking-widest px-4"
            >
              {isBulkUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldAlert className="h-3 w-3 mr-2" />}
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Moderation Stream */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            {selectedIds.size === listings.length && listings.length > 0 ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            Select Page Protocol
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Current Queue: <span className="text-foreground">{listings.length}</span> matching nodes
          </p>
        </div>

        {loading && listings.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState icon="Search" title="Registry Clear" description="No vaulted listings match your current filter protocol." />
        ) : (
          <StaggerContainer className="grid gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="flex gap-4 items-center">
                <button onClick={() => toggleSelect(listing.id)} className="flex-shrink-0 text-muted-foreground hover:text-primary">
                  {selectedIds.has(listing.id) ? <CheckSquare className="h-5 w-5 text-accent" /> : <Square className="h-5 w-5" />}
                </button>
                <ListingQueueItem 
                  className="flex-1"
                  isSelected={selectedIds.has(listing.id)}
                  listing={{
                    id: listing.id,
                    title: listing.title,
                    owner: listing.seller.name,
                    createdAt: listing.createdAt instanceof Date ? listing.createdAt : typeof listing.createdAt?.toDate === 'function' ? listing.createdAt.toDate() : new Date(listing.createdAt),
                    aiRiskScore: listing.aiRiskScore,
                    status: listing.status as any
                  }}
                  onSelect={(id) => window.location.assign(`/admin/listings/${id}`)}
                />
              </div>
            ))}
          </StaggerContainer>
        )}

        {hasMore && (
          <div className="flex justify-center p-10">
            <Button variant="outline" onClick={() => fetchListings({ append: true, startAfter: lastVisibleId })} disabled={loading} className="h-14 px-12 font-black uppercase text-[10px] tracking-widest">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</> : 'Load Next Batch'}
            </Button>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
