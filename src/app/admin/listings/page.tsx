"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "../_components/admin-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { searchListingsAction } from "@/app/actions";
import type { Listing } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { ListingQueueItem } from "@/components/admin/risk-score-display";
import { StaggerContainer } from "@/components/animations/stagger-container";

export default function AdminListingsPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisibleId, setLastVisibleId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

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
      }

      setLastVisibleId(res.lastVisibleId);
      setHasMore(Boolean(res.lastVisibleId));
    } catch (e) {
      toast({ variant: 'destructive', title: 'Registry Query Failed', description: 'Could not resolve the current listing stack.' });
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

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("pending");
  };

  return (
    <AdminPage
      title="Moderation Registry"
      description="Review vaulted properties and triage documentation risk signals."
      breadcrumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/listings", label: "Listings" }]}
    >
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4 items-end bg-card/50 p-6 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="lg:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Registry Search</Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Registry ID, Title, or Seller Name..."
              className="pl-9 h-12 bg-background font-bold shadow-inner"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Status</Label>
          <select
            className="w-full h-12 rounded-lg border border-input px-3 text-sm font-bold bg-background focus:ring-2 focus:ring-accent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="pending">Pending Triage</option>
            <option value="approved">Approved Assets</option>
            <option value="rejected">Rejected Records</option>
            <option value="all">Full Archive</option>
          </select>
        </div>
        <Button variant="outline" className="h-12 font-black uppercase text-[10px] tracking-widest" onClick={resetFilters}>Flush Filters</Button>
      </div>

      <div className="space-y-6">
        {loading && listings.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState icon={Search} title="Registry Clear" description="No vaulted listings match your current filter protocol." />
        ) : (
          <StaggerContainer className="grid gap-4">
            {listings.map((listing) => (
              <ListingQueueItem 
                key={listing.id} 
                listing={{
                  id: listing.id,
                  title: listing.title,
                  owner: listing.seller.name,
                  createdAt: listing.createdAt instanceof Date ? listing.createdAt : listing.createdAt.toDate(),
                  aiRiskScore: listing.aiRiskScore,
                  status: listing.status as any
                }}
                onSelect={(id) => window.location.assign(`/admin/listings/${id}`)}
              />
            ))}
          </StaggerContainer>
        )}

        {hasMore && (
          <div className="flex justify-center p-10">
            <Button variant="outline" onClick={() => fetchListings({ append: true, startAfter: lastVisibleId })} disabled={loading} className="h-14 px-12 font-black uppercase text-[10px] tracking-widest border-border/60 hover:bg-accent/5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load Next Protocol Batch
            </Button>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
