"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { callsApi, type CallRecord } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Phone, Clock, TrendingUp, RefreshCw, Mic2, CheckCircle2, XCircle, AlertCircle, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status?: string }) {
  const cfg: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType; color: string }> = {
    COMPLETED: { label: "Completed", variant: "default", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    IN_PROGRESS: { label: "In Progress", variant: "default", icon: Mic2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    NOT_STARTED: { label: "Queued", variant: "secondary", icon: Clock, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    NOT_CONNECTED: { label: "Not Connected", variant: "destructive", icon: PhoneOff, color: "text-red-400 bg-red-400/10 border-red-400/20" },
    FAILED: { label: "Failed", variant: "destructive", icon: XCircle, color: "text-red-400 bg-red-400/10 border-red-400/20" },
    CANCELLED: { label: "Cancelled", variant: "outline", icon: AlertCircle, color: "text-muted-foreground bg-accent/50 border-border" },
  };

  const s = cfg[status || "NOT_STARTED"] || cfg.NOT_STARTED;
  const Icon = s.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", s.color)}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function KPICard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="glass rounded-xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export default function HiringAssistantPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadCalls = useCallback(async () => {
    try {
      const data = await callsApi.list({ source: "hiring", page_size: 50 });
      setCalls(data.results);
    } catch (err) {
      toast.error("Failed to load calls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 30000);
    return () => clearInterval(interval);
  }, [loadCalls]);

  const handleRefresh = async (callId: string) => {
    setRefreshing(callId);
    try {
      await callsApi.refresh(callId);
      await loadCalls();
      toast.success("Call status refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(null);
    }
  };

  const kpis = {
    total: calls.length,
    completed: calls.filter(c => c.lifecycle_status === "COMPLETED").length,
    inProgress: calls.filter(c => c.lifecycle_status === "IN_PROGRESS").length,
    avgDuration: calls.length
      ? (calls.reduce((s, c) => s + (c.duration_minutes || 0), 0) / calls.filter(c => c.duration_minutes).length || 0).toFixed(1)
      : "—",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            AI Hiring Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Voice AI screening calls — automated candidate evaluation</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20">
          <Link href="/hiring-assistant/new">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Calls" value={kpis.total} icon={Phone} color="bg-violet-500/15 text-violet-400" />
        <KPICard label="Completed" value={kpis.completed} icon={CheckCircle2} color="bg-emerald-500/15 text-emerald-400" />
        <KPICard label="In Progress" value={kpis.inProgress} icon={Mic2} color="bg-blue-500/15 text-blue-400" />
        <KPICard label="Avg Duration" value={`${kpis.avgDuration} min`} icon={TrendingUp} color="bg-cyan-500/15 text-cyan-400" />
      </div>

      {/* Calls Table */}
      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Screening Calls</h2>
          <Button variant="ghost" size="sm" onClick={loadCalls} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : calls.length === 0 ? (
          <div className="py-20 text-center">
            <Mic2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No screening calls yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Create your first AI interview call to get started</p>
            <Button asChild className="mt-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
              <Link href="/hiring-assistant/new">
                <Plus className="w-4 h-4 mr-2" />
                New Interview
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {["Candidate", "Phone", "Role", "Status", "Duration", "Engagement", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {calls.map(call => (
                  <tr key={call.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-4 pl-6">
                      <Link href={`/hiring-assistant/${call.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {call.callee_name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {call.created_at ? new Date(call.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground font-mono">{call.mobile_number}</td>
                    <td className="px-4 py-4">
                      {call.job_role ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-accent/80 text-muted-foreground border border-border/50">
                          {call.job_role}
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={call.lifecycle_status || call.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {call.duration_minutes != null ? `${call.duration_minutes.toFixed(1)} min` : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {call.engagement_status ? (
                        <span className={cn("text-xs font-medium", call.engagement_status === "ENGAGED" ? "text-emerald-400" : "text-muted-foreground")}>
                          {call.engagement_status}
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-4 pr-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefresh(call.id)}
                          disabled={refreshing === call.id}
                          className="h-7 w-7 p-0"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", refreshing === call.id && "animate-spin")} />
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-xs">
                          <Link href={`/hiring-assistant/${call.id}`}>View</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
