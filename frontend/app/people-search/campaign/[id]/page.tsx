"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { use } from "react";
import { peopleApi, callsApi, type Campaign } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, Clock, CheckCircle2, PhoneOff, XCircle, Mic2, RefreshCw, Volume2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  IN_PROGRESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  NOT_STARTED: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  NOT_CONNECTED: "text-red-400 bg-red-400/10 border-red-400/20",
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
  CANCELLED: "text-muted-foreground bg-accent/50 border-border",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  COMPLETED: CheckCircle2,
  IN_PROGRESS: Mic2,
  NOT_STARTED: Clock,
  NOT_CONNECTED: PhoneOff,
  FAILED: XCircle,
  CANCELLED: XCircle,
};

interface Props { params: Promise<{ id: string }> }

export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await peopleApi.getCampaign(id);
      setCampaign(data);
    } catch {
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      if (campaign?.calls) {
        await Promise.allSettled(campaign.calls.map(c => callsApi.refresh(c.id)));
        await load();
      }
      toast.success("All calls refreshed");
    } catch { toast.error("Refresh failed"); }
    finally { setRefreshing(false); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  if (!campaign) return (
    <div className="text-center py-20 text-muted-foreground">Campaign not found</div>
  );

  const calls = campaign.calls || [];
  const completed = calls.filter(c => c.lifecycle_status === "COMPLETED").length;
  const engaged = calls.filter(c => c.engagement_status === "ENGAGED").length;
  const interested = calls.filter(c => c.result && Object.values(c.result).some(v =>
    String(v).toLowerCase() === "yes" || v === true
  )).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/people-search/campaign"><ArrowLeft className="w-4 h-4 mr-2" />All Campaigns</Link>
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={refreshing} className="border-border/50">
          <RefreshCw className={cn("w-3.5 h-3.5 mr-2", refreshing && "animate-spin")} />
          Refresh All
        </Button>
      </div>

      {/* Header */}
      <div className="glass rounded-2xl border border-border/50 p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground mb-4">{campaign.job_description}</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/30">
          {[
            { label: "Total Calls", value: calls.length, icon: Phone, color: "text-violet-400" },
            { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Engaged", value: engaged, icon: Mic2, color: "text-blue-400" },
            { label: "Interested", value: interested, icon: TrendingUp, color: "text-yellow-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center py-3 rounded-xl bg-accent/30 border border-border/30">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calls Table */}
      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Reachout Calls</h2>
        </div>

        {calls.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No calls yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {["Candidate", "Status", "Duration", "Engagement", "Result", "Recording"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {calls.map(call => {
                  const st = call.lifecycle_status || call.status || "NOT_STARTED";
                  const StatusIcon = STATUS_ICONS[st] || Clock;
                  return (
                    <tr key={call.id} className="hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-4 pl-6">
                        <div className="font-medium text-foreground">{call.callee_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{call.mobile_number}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", STATUS_COLORS[st] || STATUS_COLORS.NOT_STARTED)}>
                          <StatusIcon className="w-3 h-3" />
                          {st.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {call.duration_minutes != null ? `${call.duration_minutes.toFixed(1)}m` : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={cn("font-medium", call.engagement_status === "ENGAGED" ? "text-emerald-400" : "text-muted-foreground")}>
                          {call.engagement_status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {call.result && Object.keys(call.result).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(call.result).slice(0, 2).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground capitalize">{k}:</span>
                                <span className={cn("text-xs font-medium",
                                  String(v).toLowerCase() === "yes" || v === true ? "text-emerald-400" :
                                  String(v).toLowerCase() === "no" || v === false ? "text-red-400" : "text-foreground"
                                )}>
                                  {String(v)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-4 pr-6">
                        {call.recording_url ? (
                          <a href={call.recording_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Volume2 className="w-3.5 h-3.5" />
                            Listen
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
