"use client";

import { useEffect, useState } from "react";
import { AdminPage } from "../_components/admin-page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, History, Download, User, Calendar } from "lucide-react";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import type { AuditLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        let q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
        
        if (entityFilter !== "all") {
          q = query(collection(db, "auditLogs"), where("entityType", "==", entityFilter), orderBy("timestamp", "desc"), limit(50));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AuditLog[];
        setLogs(data);
      } catch (error) {
        console.error("Audit fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [entityFilter]);

  const filteredLogs = logs.filter(log => 
    log.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entityId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => {
      const oldVal = typeof value.old === 'object' ? JSON.stringify(value.old) : String(value.old);
      const newVal = typeof value.new === 'object' ? JSON.stringify(value.new) : String(value.new);
      return (
        <div key={key} className="text-[10px] leading-tight mb-1">
          <span className="font-black uppercase text-muted-foreground mr-1">{key}:</span>
          <span className="text-risk line-through opacity-60 mr-1">{oldVal}</span>
          <span className="text-success font-bold">{newVal}</span>
        </div>
      );
    });
  };

  return (
    <AdminPage
      title="Audit Trail"
      description="History of all critical platform actions, badge assignments, and moderation decisions."
      breadcrumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/audit", label: "Audit Trail" }]}
      actions={
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" /> Export Trail
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Admin ID or Action..."
              value={searchQuery}
              onChange={(e) => setSearchSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity Category</Label>
          <select
            className="w-full h-11 rounded-md border px-3 text-sm bg-background"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="listing">Listing Moderation</option>
            <option value="platform_settings">System Config</option>
            <option value="user">Identity Changes</option>
          </select>
        </div>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg font-black tracking-tight uppercase flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            System Events
          </CardTitle>
          <CardDescription className="text-xs">Showing latest 50 security-critical events.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon="History"
              title="No events found"
              description="Adjust your search or category filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Time (UTC)</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Administrator</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Operation</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Resource</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow 
                    key={log.id} 
                    className={cn(
                      "hover:bg-muted/5 transition-colors animate-in fade-in slide-in-from-left-4 fill-mode-backwards", 
                      !!log.id && "animate-duration-500"
                    )}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <TableCell className="text-[11px] font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {typeof log.timestamp?.toDate === 'function'
                          ? format(log.timestamp.toDate(), "MMM d, HH:mm:ss")
                          : format(new Date(log.timestamp), "MMM d, HH:mm:ss")
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight truncate max-w-[120px]" title={log.adminId}>
                          {log.adminId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest border-none px-2 h-5",
                        log.action === 'UPDATE' ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      )}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-foreground/80">{log.entityType}</span>
                        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[100px]">{log.entityId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="max-w-[300px]">
                        {formatChanges(log.changes)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
