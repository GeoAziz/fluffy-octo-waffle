'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminStatsAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsChart } from './_components/analytics-chart';
import { AdminPage } from './_components/admin-page';


type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  // Fetch stats once on component mount
  useEffect(() => {
    getAdminStatsAction().then(setStats).catch(console.error);
  }, []);

  return (
    <AdminPage
      title="Dashboard"
      description="An overview of the platform's activity and listing statuses."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }]}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats ? <div className="text-2xl font-bold">{stats.total}</div> : <Skeleton className="h-8 w-16"/>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {stats ? <div className="text-2xl font-bold">{stats.pending}</div> : <Skeleton className="h-8 w-16"/>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Listings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats ? <div className="text-2xl font-bold">{stats.approved}</div> : <Skeleton className="h-8 w-16"/>}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Listings</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats ? <div className="text-2xl font-bold">{stats.rejected}</div> : <Skeleton className="h-8 w-16"/>}
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <AnalyticsChart />
      </div>

    </AdminPage>
  );
}
