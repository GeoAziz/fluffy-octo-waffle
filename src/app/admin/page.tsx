'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, List, ArrowUpRight, Activity, ShieldAlert, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAdminStatsAction } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsChart } from './_components/analytics-chart';
import { AdminPage } from './_components/admin-page';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    getAdminStatsAction()
      .then(setStats)
      .then(() => setUpdatedAt(new Date()))
      .catch(console.error);
  }, []);

  const statusCards = [
    {
      title: 'Pending Triage',
      value: stats?.pending ?? null,
      icon: Clock,
      href: '/admin/listings?status=pending',
      helper: 'Needs action immediately',
      color: 'text-warning'
    },
    {
      title: 'Active Flags',
      value: 12, // Mocked for UI priority
      icon: ShieldAlert,
      href: '/admin/inbox?tab=reports',
      helper: 'Require deep audit',
      color: 'text-risk'
    },
    {
      title: 'Unread Inquiries',
      value: 5, // Mocked for UI priority
      icon: TrendingUp,
      href: '/admin/inbox?tab=messages',
      helper: 'Awaiting response',
      color: 'text-accent'
    },
    {
      title: 'Total Registry',
      value: stats?.total ?? null,
      icon: List,
      href: '/admin/listings',
      helper: 'Vaulted records',
      color: 'text-primary'
    },
  ];

  return (
    <AdminPage
      title="Admin Dashboard"
      description="Operational command center for the high-trust property registry."
      breadcrumbs={[{ href: '/admin', label: 'Dashboard' }]}
      actions={(
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="shadow-glow font-bold uppercase text-[10px] tracking-widest h-10 px-6">
            <Link href="/admin/listings?status=pending">
              Execute Triage
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-10 px-6 font-bold uppercase text-[10px] tracking-widest">
            <Link href="/admin/inbox">Secure Inbox</Link>
          </Button>
        </div>
      )}
    >
      {/* 1. Primary Action Queue - P0 Recommendation */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" /> High-Priority Protocol Queue
          </h2>
          {updatedAt && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Sync Node: {updatedAt.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => (
            <Link key={card.title} href={card.href} className="group">
              <Card className="transition-all duration-300 hover:shadow-xl hover:border-accent/40 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className={cn("absolute top-0 left-0 w-1 h-full", card.color.replace('text-', 'bg-'))} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", card.color)} />
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-black tracking-tighter">{card.value}</div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{card.helper}</span>
                    </div>
                  ) : (
                    <Skeleton className="h-10 w-24" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Platform Health & Performance */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <Card className="border-none shadow-xl bg-accent/5 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={60} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-accent">Protocol Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-foreground">98.4%</span>
              <Badge className="bg-emerald-500 text-white border-none text-[8px] h-4"><TrendingUp className="h-2 w-2 mr-1" /> HEALTHY</Badge>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Average Review Cycle: 1.4 Days</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-risk/5 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={60} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-risk">Fraud Triage Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-foreground">{statusCards[1].value}</span>
              <Badge variant="risk" className="text-[8px] h-4">ACTIVE FLAGS</Badge>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Requiring Deep Document Scan</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-primary/5 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={60} /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Registry Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-foreground">+156</span>
              <Badge className="bg-primary text-white border-none text-[8px] h-4">NEW AGENTS</Badge>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Identity Nodes Provisioned (30d)</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Analytical Trends */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" /> Performance Timeline
        </h2>
        <AnalyticsChart />
      </div>
    </AdminPage>
  );
}
