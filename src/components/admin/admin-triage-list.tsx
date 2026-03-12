'use client';

import { useState, useMemo } from 'react';
import type { Listing } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Clock, TrendingUp, Eye, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TriageMetrics {
  riskScore: number; // 0-100: higher = more risky
  ageInHours: number;
  timeUntilSLA: number; // hours remaining before SLA breach
  flagCount: number;
  evidenceQuality: 'low' | 'medium' | 'high';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface AdminTriageListProps {
  listings: Listing[];
  slaDays?: number; // Days to complete review (default 2)
}

/**
 * AdminTriageList - Prioritized listing queue for admin review
 * 
 * Features:
 * - Risk scoring (0-100) based on age, flags, image analysis, evidence quality
 * - SLA tracking (time until review deadline)
 * - Multi-sort options (risk score, age, SLA time remaining, evidence quality)
 * - Visual urgency indicators
 * - Quick action links to review page
 * 
 * Scoring System:
 * - Base: 20 points
 * - Age: +1 point per hour (max 30)
 * - Flags/Suspicious: +20 per flag (max 20)
 * - No evidence: +15
 * - Low evidence quality: +10
 * - SLA breach risk (< 4 hours): +5
 */
export function AdminTriageList({ listings, slaDays = 2 }: AdminTriageListProps) {
  const [sortBy, setSortBy] = useState<'risk' | 'age' | 'sla' | 'evidence'>('risk');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'flagged'>('all');

  const calculateMetrics = (listing: Listing): TriageMetrics => {
    const createdDate = listing.createdAt?._seconds ? new Date(listing.createdAt._seconds * 1000) : new Date();
    const ageInHours = differenceInHours(new Date(), createdDate);
    const slaDays_ = differenceInDays(new Date(), createdDate);
    const timeUntilSLA = slaDays * 24 - ageInHours;

    let riskScore = 20; // Base score

    // Age: 1 point per hour (max 30)
    riskScore += Math.min(ageInHours, 30);

    // Suspicious flag: +20
    if (listing.imageAnalysis?.isSuspicious === true) {
      riskScore += 20;
    }

    // Evidence quality assessment
    const evidenceCount = (listing as any).evidenceCount || 0;
    const hasEvidence = evidenceCount > 0;
    if (!hasEvidence) {
      riskScore += 15;
    } else if (evidenceCount === 1) {
      riskScore += 5;
    }

    // SLA breach risk (< 4 hours remaining)
    if (timeUntilSLA < 4) {
      riskScore += 5;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // Determine priority
    let priority: 'critical' | 'high' | 'medium' | 'low';
    if (riskScore >= 80 || timeUntilSLA < 4) priority = 'critical';
    else if (riskScore >= 60 || timeUntilSLA < 12) priority = 'high';
    else if (riskScore >= 40 || timeUntilSLA < 24) priority = 'medium';
    else priority = 'low';

    // Evidence quality
    let evidenceQuality: 'low' | 'medium' | 'high' = 'low';
    if (hasEvidence) {
      if (evidenceCount >= 3) evidenceQuality = 'high';
      else if (evidenceCount >= 2) evidenceQuality = 'medium';
      else evidenceQuality = 'low';
    }

    return {
      riskScore,
      ageInHours,
      timeUntilSLA,
      flagCount: listing.imageAnalysis?.isSuspicious === true ? 1 : 0,
      evidenceQuality,
      priority,
    };
  };

  const filteredListings = listings.filter(l => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return l.status === 'pending';
    if (filterStatus === 'flagged') return calculateMetrics(l).flagCount > 0;
    return true;
  });

  const sortedListings = useMemo(() => {
    const withMetrics = filteredListings.map(l => ({
      listing: l,
      metrics: calculateMetrics(l),
    }));

    return withMetrics.sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return b.metrics.riskScore - a.metrics.riskScore;
        case 'age':
          return b.metrics.ageInHours - a.metrics.ageInHours;
        case 'sla':
          return a.metrics.timeUntilSLA - b.metrics.timeUntilSLA;
        case 'evidence':
          const evidenceRank = { low: 0, medium: 1, high: 2 };
          return evidenceRank[a.metrics.evidenceQuality] - evidenceRank[b.metrics.evidenceQuality];
        default:
          return 0;
      }
    });
  }, [filteredListings, sortBy]);

  const getPriorityColor = (priority: TriageMetrics['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-700 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30';
      case 'low':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    }
  };

  const getPriorityIcon = (priority: TriageMetrics['priority']) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">
                Review Queue ({sortedListings.length})
              </CardTitle>
              <CardDescription className="mt-1 text-sm font-medium">
                Listings sorted by priority and SLA timeline
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
                <SelectTrigger className="h-10 w-full sm:w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="flagged">Flagged Items</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="h-10 w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Score (High First)</SelectItem>
                  <SelectItem value="age">Oldest First</SelectItem>
                  <SelectItem value="sla">SLA Time (Urgent First)</SelectItem>
                  <SelectItem value="evidence">Evidence Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Triage Table */}
      {sortedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed bg-muted/10">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-tight mb-2">Queue Clear</h3>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            All listings have been reviewed! Check back soon for new submissions.
          </p>
        </div>
      ) : (
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3">Priority</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3">Listing</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3 text-center">Risk</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3 text-center">Age</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3 text-center">SLA</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3 text-center">Evidence</TableHead>
                  <TableHead className="font-black uppercase text-xs tracking-widest py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedListings.map(({ listing, metrics }) => (
                  <TableRow
                    key={listing.id}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      metrics.priority === 'critical' && 'bg-destructive/5 hover:bg-destructive/10'
                    )}
                  >
                    {/* Priority Badge */}
                    <TableCell className="py-4">
                      <Badge variant="outline" className={cn('font-black uppercase text-[10px] tracking-widest flex items-center gap-1 w-fit', getPriorityColor(metrics.priority))}>
                        {getPriorityIcon(metrics.priority)}
                        {metrics.priority}
                      </Badge>
                    </TableCell>

                    {/* Listing Title */}
                    <TableCell className="py-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-sm leading-tight hover:text-primary transition-colors cursor-pointer">
                          {listing.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{listing.location}</p>
                      </div>
                    </TableCell>

                    {/* Risk Score */}
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="relative h-6 w-12 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              metrics.riskScore >= 80
                                ? 'bg-destructive'
                                : metrics.riskScore >= 60
                                  ? 'bg-orange-500'
                                  : metrics.riskScore >= 40
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                            )}
                            style={{ width: `${metrics.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right">{metrics.riskScore}</span>
                      </div>
                    </TableCell>

                    {/* Age */}
                    <TableCell className="py-4 text-center">
                      <p className="text-xs font-bold">{metrics.ageInHours}h</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(listing.createdAt?._seconds ? listing.createdAt._seconds * 1000 : 0), {
                          addSuffix: false,
                        })} ago
                      </p>
                    </TableCell>

                    {/* SLA Time */}
                    <TableCell className="py-4 text-center">
                      <p className={cn('text-xs font-bold', metrics.timeUntilSLA < 4 ? 'text-destructive' : metrics.timeUntilSLA < 12 ? 'text-orange-600' : 'text-green-600')}>
                        {Math.max(0, metrics.timeUntilSLA)}h
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {metrics.timeUntilSLA < 0 ? '⚠️ BREACHED' : 'remaining'}
                      </p>
                    </TableCell>

                    {/* Evidence */}
                    <TableCell className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {metrics.evidenceQuality === 'high' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : metrics.evidenceQuality === 'medium' ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-xs font-bold capitalize">{metrics.evidenceQuality}</span>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-4">
                      <Button
                        asChild
                        size="sm"
                        className="h-8 px-4 font-bold uppercase text-[10px] tracking-widest"
                      >
                        <Link href={`/admin/listings/${listing.id}`}>
                          <Eye className="h-3 w-3 mr-1" /> Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* SLA Info Box */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4" /> SLA Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs font-medium text-muted-foreground space-y-2">
          <p>
            • <strong>Review SLA:</strong> {slaDays} days from submission
          </p>
          <p>
            • <strong>Risk Score:</strong> 0-100 composite metric based on age, flags, and evidence quality
          </p>
          <p>
            • <strong>Critical:</strong> Risk ≥80 or SLA breach imminent (&lt;4 hours)
          </p>
          <p>
            • <strong>Priority Sorting:</strong> Always review critical/high items first for best service
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
