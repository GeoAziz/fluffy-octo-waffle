'use client';

import { AdminPage } from '../_components/admin-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAdminAnalyticsSummaryAction } from '@/app/actions';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

type Range = '7' | '30' | '90' | 'custom';

type AnalyticsSummary = {
  moderationTotals: { approved: number; pending: number; rejected: number };
  trendDeltas: { approved: number; pending: number; rejected: number };
  countyDistribution: { county: string; count: number }[];
  badgeDistribution: { badge: 'Gold' | 'Silver' | 'Bronze' | 'None'; count: number }[];
  moderationTimeline: { date: string; approved: number; rejected: number }[];
  pendingAgeBuckets: { bucket: string; count: number }[];
  window: { startDate: string; endDate: string };
};

const BADGE_COLORS: Record<string, string> = {
  Gold: '#f59e0b',
  Silver: '#64748b',
  Bronze: '#a16207',
  None: '#94a3b8',
};

const Delta = ({ value }: { value: number }) => {
  if (value === 0) {
    return <span className="text-muted-foreground text-xs font-normal">(no change)</span>;
  }
  const isPositive = value > 0;
  return (
    <span className={cn('text-xs font-semibold flex items-center', isPositive ? 'text-green-600' : 'text-red-600')}>
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload =
        range === 'custom' && startDate && endDate
          ? await getAdminAnalyticsSummaryAction({ startDate, endDate })
          : await getAdminAnalyticsSummaryAction({ days: Number(range) as 7 | 30 | 90 });
      setSummary(payload as AnalyticsSummary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const moderationTotals = summary?.moderationTotals ?? { approved: 0, pending: 0, rejected: 0 };
  const trendDeltas = summary?.trendDeltas ?? { approved: 0, pending: 0, rejected: 0 };

  const exportCsv = () => {
    if (!summary) return;
    const rows = [
      'section,key,value',
      ...summary.countyDistribution.map((x) => `county_distribution,${x.county},${x.count}`),
      ...summary.badgeDistribution.map((x) => `badge_distribution,${x.badge},${x.count}`),
      ...summary.pendingAgeBuckets.map((x) => `pending_age,${x.bucket},${x.count}`),
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
      title="Analytics"
      description="Line, bar, and pie breakdowns for moderation and listing distribution."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/analytics', label: 'Analytics' }]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={!summary}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      }
    >
      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Date range</Label>
            <Select value={range} onValueChange={(value) => setRange(value as Range)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {range === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={fetchData} disabled={!startDate || !endDate}>
                  Apply custom range
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Approved</CardTitle>
            {summary && <Delta value={trendDeltas.approved} />}
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{moderationTotals.approved}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">New Pending</CardTitle>
            {summary && <Delta value={trendDeltas.pending} />}
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{moderationTotals.pending}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Rejected</CardTitle>
            {summary && <Delta value={trendDeltas.rejected} />}
          </CardHeader>
          <CardContent>{loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{moderationTotals.rejected}</p>}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moderation trend (line)</CardTitle>
            <CardDescription>Approvals and rejections over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading || !summary ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.moderationTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approved" stroke="#16a34a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by county (bar)</CardTitle>
            <CardDescription>Top counties by listing volume in this period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading || !summary ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.countyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="county" interval={0} angle={-20} height={70} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge distribution (pie)</CardTitle>
            <CardDescription>Trust levels across approved listings created in this period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading || !summary ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.badgeDistribution} dataKey="count" nameKey="badge" outerRadius={110} label>
                    {summary.badgeDistribution.map((entry) => (
                      <Cell key={`cell-${entry.badge}`} fill={BADGE_COLORS[entry.badge] || '#cccccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending queue aging</CardTitle>
            <CardDescription>How long all current pending listings have been waiting.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading || !summary ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.pendingAgeBuckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}
