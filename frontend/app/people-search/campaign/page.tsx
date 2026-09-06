"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { peopleApi, type Campaign } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, Phone, ArrowLeft, Users, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peopleApi.listCampaigns()
      .then(d => setCampaigns(d.campaigns))
      .catch(() => toast.error("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/people-search"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Campaigns
          </h1>
        </div>
        <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
          <Link href="/people-search"><Plus className="w-4 h-4 mr-2" />New Search</Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="py-20 text-center glass rounded-2xl border border-border/50">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No campaigns yet</p>
          <Button asChild className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            <Link href="/people-search">Start a Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <Link key={c.id} href={`/people-search/campaign/${c.id}`}>
              <div className="glass rounded-xl border border-border/50 p-5 hover:border-primary/40 transition-all card-hover flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.job_description}</div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{c.total_candidates} candidates</span>
                    <span>{c.calls_initiated} calls initiated</span>
                    {c.created_at && <span>{new Date(c.created_at).toLocaleDateString("en-IN")}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
