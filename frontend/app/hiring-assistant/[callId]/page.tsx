"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { use } from "react";
import { callsApi, type CallRecord } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Mic2, Phone, Clock, User, RefreshCw,
  CheckCircle2, XCircle, PhoneOff, Volume2, ExternalLink,
  Briefcase, Activity
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse", icon: Mic2 },
  NOT_STARTED: { label: "Queued", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  NOT_CONNECTED: { label: "Not Connected", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: PhoneOff },
  FAILED: { label: "Failed", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "text-muted-foreground bg-accent/50 border-border", icon: XCircle },
};

interface Props {
  params: Promise<{ callId: string }>;
}

export default function CallDetailPage({ params }: Props) {
  const { callId } = use(params);
  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCall = useCallback(async () => {
    try {
      const data = await callsApi.get(callId);
      setCall(data);
    } catch {
      toast.error("Failed to load call details");
    } finally {
      setLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    loadCall();
    // Poll every 15s for live calls
    const interval = setInterval(loadCall, 15000);
    return () => clearInterval(interval);
  }, [loadCall]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await callsApi.refresh(callId);
      await loadCall();
      toast.success("Status refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Call not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/hiring-assistant">← Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[call.lifecycle_status || call.status || "NOT_STARTED"] || STATUS_CONFIG.NOT_STARTED;
  const StatusIcon = statusCfg.icon;

  const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between items-start py-3 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-xs">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/hiring-assistant">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-border/50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Header Card */}
      <div className="glass rounded-2xl border border-border/50 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{call.callee_name}</h1>
              <p className="text-muted-foreground font-mono text-sm">{call.mobile_number}</p>
              {call.job_role && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{call.job_role}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border", statusCfg.color)}>
            <StatusIcon className="w-4 h-4" />
            {statusCfg.label}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
          {[
            { label: "Duration", value: call.duration_minutes != null ? `${call.duration_minutes.toFixed(1)} min` : "—", icon: Clock },
            { label: "Engagement", value: call.engagement_status || "—", icon: Activity },
            { label: "Answered By", value: call.answered_by || "—", icon: Phone },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recording */}
      {call.recording_url && (
        <div className="glass rounded-2xl border border-border/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Call Recording</h2>
          </div>
          <audio controls className="w-full rounded-lg" src={call.recording_url}>
            Your browser does not support audio.
          </audio>
          <a
            href={call.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>
        </div>
      )}

      {/* AI Result */}
      {call.result && Object.keys(call.result).length > 0 && (
        <div className="glass rounded-2xl border border-emerald-500/20 p-6 mb-6 bg-emerald-500/3">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-foreground">AI Evaluation Result</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(call.result).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-accent/40 border border-border/50 p-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  {key.replace(/_/g, " ")}
                </div>
                <div className={cn(
                  "text-base font-semibold",
                  String(value).toLowerCase() === "yes" || value === true ? "text-emerald-400" :
                  String(value).toLowerCase() === "no" || value === false ? "text-red-400" :
                  "text-foreground"
                )}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Details */}
      <div className="glass rounded-2xl border border-border/50 p-6">
        <h2 className="font-semibold text-foreground mb-2">Call Details</h2>
        <div className="divide-y divide-border/30">
          <DetailRow label="Call ID" value={call.id} />
          <DetailRow label="Agent ID" value={call.agent_id} />
          <DetailRow label="Request ID" value={call.request_id} />
          <DetailRow label="Status" value={call.status} />
          <DetailRow label="Lifecycle Status" value={call.lifecycle_status} />
          <DetailRow label="Call Ended By" value={call.call_ended_by} />
          <DetailRow label="Created" value={call.created_at ? new Date(call.created_at).toLocaleString("en-IN") : undefined} />
          <DetailRow label="Started" value={call.started_at ? new Date(call.started_at).toLocaleString("en-IN") : undefined} />
          <DetailRow label="Ended" value={call.ended_at ? new Date(call.ended_at).toLocaleString("en-IN") : undefined} />
        </div>
      </div>
    </div>
  );
}
