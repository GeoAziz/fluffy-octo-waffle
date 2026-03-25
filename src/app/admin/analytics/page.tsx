'use client';

import { AdminPage } from '../_components/admin-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, ArrowUp, ArrowDown, Activity, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAdminAnalyticsSummaryAction } from '@/app/actions';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { PageGrid } from '@/components/page-wrapper';

type Range = '7' | '30' | '90' | 'custom';

type AnalyticsSummary = {
  moderationTotals: { approved: number; pending: number; rejected: number };
  trendDeltas: { approved: number; pending: number; rejected: number };
  countyDistribution: { county: string; count: number }[];
  badgeDistribution: { badge: 'Gold' | 'Silver' | 'Bronze' | 'None'; count: number }[];
  moderationTimeline: { date: string; approved: number; rejected: number }[];
  pendingAgeBuckets: { bucket: string; count: number }[];
  rejectionReasons: { reason: string; count: number }[];
  repeatOffenders: { ownerId: string; count: number }[];
  fraudSignals: { suspiciousListings: number; evidenceCompletenessAverage: number };
  modelDrift: { reviewedCount: number; overridesCount: number; overrideRate: number };
  window: { startDate: string; endDate: string };
};

const BADGE_COLORS: Record<string, string> = {
  Gold: '#10b981', // emerald-500
  Silver: '#2f6f95', // accent
  Bronze: '#c58b2e', // warning
  None: '#94a3b8',
};

const Delta = ({ value }: { value: number }) => {
  if (value === 0) {
    return <span className="text-muted-foreground text-[10px] font-normal uppercase tracking-widest">(no change)</span>;
  }
  const isPositive = value > 0;
  return (
    <span className={cn('text-[10px] font-black uppercase tracking-widest flex items-center', isPositive ? 'text-emerald-600' : 'text-risk')}>
      {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
      {Math.abs(value)}%
    </span>
  );
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const payload =
        range === 'custom' && startDate && endDate
          ? await getAdminAnalyticsSummaryAction({ startDate, endDate })
          : await getAdminAnalyticsSummaryAction({ days: Number(range) as 7 | 30 | 90 });
      setSummary(payload as unknown as AnalyticsSummary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [range, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const moderationTotals = summary?.moderationTotals ?? { approved: 0, pending: 0, rejected: 0 };
  const trendDeltas = summary?.trendDeltas ?? { approved: 0, pending: 0, rejected: 0 };
  const fraudSignals = summary?.fraudSignals ?? { suspiciousListings: 0, evidenceCompletenessAverage: 0 };
  const modelDrift = summary?.modelDrift ?? { reviewedCount: 0, overridesCount: 0, overrideRate: 0 };

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      'section,key,value',
      ...summary.countyDistribution.map((x) => `county_distribution,${x.county},${x.count}`),
      ...summary.badgeDistribution.map((x) => `badge_distribution,${x.badge},${x.count}`),
      ...summary.pendingAgeBuckets.map((x) => `pending_age,${x.bucket},${x.count}`),
      ...summary.rejectionReasons.map((x) => `rejection_reason,${x.reason},${x.count}`),
      ...summary.repeatOffenders.map((x) => `repeat_offender,${x.ownerId},${x.count}`),
      `fraud_signals,suspicious_listings,${summary.fraudSignals.suspiciousListings}`,
      `fraud_signals,evidence_completeness_average,${summary.fraudSignals.evidenceCompletenessAverage}`,
      `model_drift,reviewed_count,${summary.modelDrift.reviewedCount}`,
      `model_drift,overrides_count,${summary.modelDrift.overridesCount}`,
      `model_drift,override_rate,${summary.modelDrift.overrideRate}`,
      ...summary.moderationTimeline.flatMap((x) => [
        `moderation_timeline:${x.date},approved,${x.approved}`,
        `moderation_timeline:${x.date},rejected,${x.rejected}`,
      ]),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-analytics-${summary.window.startDate}-to-${summary.window.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPage
      title="Platform Analytics"
      description="Deep-dive into moderation velocity, document integrity metrics, and listing distribution."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/analytics', label: 'Analytics' }]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="h-10 font-bold uppercase text-[10px] tracking-widest">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Sync Pulse
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={!summary} className="h-10 font-black uppercase text-[10px] tracking-widest shadow-glow">
            <Download className="mr-2 h-3.5 w-3.5" />
            Export Vault
          </Button>
        </div>
      }
    >
      {/* Date Filter Protocol */}
      <Card className="mb-8 border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardContent className="grid gap-6 pt-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Range Select</Label>
            <Select value={range} onValueChange={(value) => setRange(value as Range)}>
              <SelectTrigger className="h-11 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Cycles</SelectItem>
                <SelectItem value="30">Last 30 Cycles</SelectItem>
                <SelectItem value="90">Last 90 Cycles</SelectItem>
                <SelectItem value="custom">Custom Protocol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {range === 'custom' && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                <Label htmlFor="start-date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Epoch</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 font-bold" />
              </div>
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                <Label htmlFor="end-date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Epoch</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 font-bold" />
              </div>
              <div className="flex items-end">
                <Button className="w-full h-11 font-black uppercase text-[10px] tracking-widest" onClick={fetchData} disabled={!startDate || !endDate}>
                  Execute Filter
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* KPI Signals */}
      <PageGrid columns={3} className="mb-8">
        <Card className="border-none shadow-lg bg-emerald-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BadgeCheck size={80} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <BadgeCheck className="h-3 w-3" /> Approved Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            {loading ? <Skeleton className="h-10 w-24 bg-white/20" /> : <p className="text-4xl font-black">{moderationTotals.approved}</p>}
            {summary && <div className="bg-white/20 rounded px-2 py-1"><Delta value={trendDeltas.approved} /></div>}
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-accent text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <Activity className="h-3 w-3" /> Pending Triage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            {loading ? <Skeleton className="h-10 w-24 bg-white/20" /> : <p className="text-4xl font-black">{moderationTotals.pending}</p>}
            {summary && <div className="bg-white/20 rounded px-2 py-1"><Delta value={trendDeltas.pending} /></div>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-risk text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={80} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Rejected Records
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            {loading ? <Skeleton className="h-10 w-24 bg-white/20" /> : <p className="text-4xl font-black">{moderationTotals.rejected}</p>}
            {summary && <div className="bg-white/20 rounded px-2 py-1"><Delta value={trendDeltas.rejected} /></div>}
          </CardContent>
        </Card>
      </PageGrid>

      <PageGrid columns={3} className="mb-8">
        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Suspicious Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-10 w-24" /> : <p className="text-3xl font-black">{fraudSignals.suspiciousListings}</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Evidence Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-10 w-24" /> : <p className="text-3xl font-black">{fraudSignals.evidenceCompletenessAverage}%</p>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest">Model Drift (Override Rate)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <p className="text-3xl font-black">{modelDrift.overrideRate}%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {modelDrift.overridesCount} overrides / {modelDrift.reviewedCount} reviewed
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </PageGrid>

      {/* Visual Data Nodes */}
      <div className="grid gap-8 xl:grid-cols-2">
        <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Moderation Velocity (Line)</CardTitle>
            <CardDescription className="text-xs">Timeline of approved vs rejected protocols.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loading || !summary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.moderationTimeline} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'}} />
                  <Line type="monotone" name="Approved" dataKey="approved" stroke="#10b981" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                  <Line type="monotone" name="Rejected" dataKey="rejected" stroke="#8c2f39" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Listing Heatmap (Bar)</CardTitle>
            <CardDescription className="text-xs">Vault density by primary county signals.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loading || !summary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.countyDistribution} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="county" interval={0} angle={-25} textAnchor="end" height={60} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'hsl(var(--accent)/0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Signal Distribution (Pie)</CardTitle>
            <CardDescription className="text-xs">Current trust signals across all approved records.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loading || !summary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.badgeDistribution} dataKey="count" nameKey="badge" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label>
                    {summary.badgeDistribution.map((entry) => (
                      <Cell key={`cell-${entry.badge}`} fill={BADGE_COLORS[entry.badge] || '#cccccc'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'}} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Queue Latency (Aging)</CardTitle>
            <CardDescription className="text-xs">Wait times for pending documentation triage.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loading || !summary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.pendingAgeBuckets} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis dataKey="bucket" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Rejection Reasons (Top)</CardTitle>
            <CardDescription className="text-xs">Most frequent rejection causes in the selected window.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            {loading || !summary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.rejectionReasons} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="reason"
                    type="category"
                    width={160}
                    tick={{fontSize: 9, fontWeight: 700}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}
