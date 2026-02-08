'use client';

import { AdminPage } from '../_components/admin-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminStatsAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStatsAction()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approvalRate = stats ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(1) : 0;
  const pendingPercent = stats ? ((stats.pending / stats.total) * 100).toFixed(1) : 0;

  return (
    <AdminPage
      title="Analytics"
      description="Platform performance and listing approval metrics."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/analytics', label: 'Analytics' }]}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats?.total}</div>}
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{approvalRate}%</div>}
            <p className="text-xs text-muted-foreground mt-1">{stats?.approved} of {(stats?.approved ?? 0) + (stats?.rejected ?? 0)} reviewed</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-yellow-900">{stats?.pending}</div>}
            <p className="text-xs text-muted-foreground mt-1">{pendingPercent}% of all listings</p>
          </CardContent>
        </Card>

        {/* Rejection Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.rejected && (stats?.approved ?? 0) + (stats?.rejected ?? 0) > 0
                  ? (((stats.rejected) / ((stats.approved ?? 0) + (stats.rejected ?? 0))) * 100).toFixed(1)
                  : 0}
                %
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{stats?.rejected} rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution of all listings by approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                {/* Pending */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-sm font-semibold">{stats?.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${((stats?.pending ?? 0) / (stats?.total ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Approved */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-sm font-semibold">{stats?.approved}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${((stats?.approved ?? 0) / (stats?.total ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rejected */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="text-sm font-semibold">{stats?.rejected}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${((stats?.rejected ?? 0) / (stats?.total ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Platform performance summary</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Total Listings</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.total}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">Ready for Buyers</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.approved}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-900">Need Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pending}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}
