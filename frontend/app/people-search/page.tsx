"use client";

import { useState } from "react";
import Link from "next/link";
import { agentsApi, peopleApi, type Agent, type Candidate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Search, Phone, ExternalLink, Star, MapPin,
  Briefcase, Loader2, CheckSquare2, Square, Zap, BarChart3, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SAMPLE_JDS = [
  {
    label: "Senior Software Engineer",
    text: "Looking for a Senior Software Engineer with 5+ years of experience in Python, React, and AWS. Must have strong backend skills, REST API design experience, and familiarity with microservices architecture. Experience with ML pipelines is a plus.",
  },
  {
    label: "Product Manager",
    text: "Seeking an experienced Product Manager with 4+ years building B2B SaaS products. Must have strong analytical skills, experience with Agile methodologies, and data-driven decision making. Experience in HR tech or fintech preferred.",
  },
  {
    label: "Data Scientist",
    text: "Hiring a Data Scientist with expertise in Python, ML frameworks (TensorFlow/PyTorch), and SQL. Must have experience building and deploying ML models at scale. Knowledge of NLP and LLMs is a strong plus.",
  },
];

function CandidateCard({
  candidate,
  selected,
  onToggle,
}: {
  candidate: Candidate;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "glass rounded-xl border p-5 cursor-pointer transition-all hover:border-primary/40 card-hover",
        selected ? "border-primary/60 bg-primary/5" : "border-border/50"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="mt-0.5 flex-shrink-0">
          {selected ? (
            <CheckSquare2 className="w-5 h-5 text-primary" />
          ) : (
            <Square className="w-5 h-5 text-muted-foreground/40" />
          )}
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
          {candidate.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{candidate.full_name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.title}</p>
              {candidate.company && (
                <p className="text-xs text-muted-foreground/70">{candidate.company}</p>
              )}
            </div>
            {candidate.match_score != null && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">{candidate.match_score}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {candidate.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
            )}
            {candidate.experience_years != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                {candidate.experience_years}y exp
              </span>
            )}
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {candidate.skills.slice(0, 4).map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-accent/80 text-muted-foreground border border-border/50">
                  {s}
                </span>
              ))}
              {candidate.skills.length > 4 && (
                <span className="text-xs text-muted-foreground/60">+{candidate.skills.length - 4} more</span>
              )}
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/30">
            {candidate.email && (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">{candidate.email}</span>
            )}
            {candidate.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Phone className="w-3 h-3" />
                {candidate.phone}
              </span>
            )}
            {candidate.linkedin_url && (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-3 h-3" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PeopleSearchPage() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [dataSource, setDataSource] = useState("");

  // Reachout state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [reaching, setReaching] = useState(false);
  const [showReachout, setShowReachout] = useState(false);

  const handleSearch = async () => {
    if (!jd.trim()) { toast.error("Please enter a job description"); return; }
    setSearching(true);
    setCandidates([]);
    setSelected(new Set());
    setSearched(false);

    try {
      const res = await peopleApi.search(jd, 20);
      setCandidates(res.candidates);
      setDataSource(res.source);
      setSearched(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(candidates.map(c => c.id)));
  const clearAll = () => setSelected(new Set());

  const openReachout = async () => {
    if (selected.size === 0) { toast.error("Select at least one candidate"); return; }
    setShowReachout(true);
    if (agents.length === 0) {
      setLoadingAgents(true);
      try {
        const d = await agentsApi.list();
        setAgents(d.results.filter(a => a.status === "ACTIVE" || !a.status));
        if (d.results.length > 0) setAgentId(d.results[0].id);
      } catch { toast.error("Could not load agents"); }
      finally { setLoadingAgents(false); }
    }
  };

  const handleReachout = async () => {
    if (!agentId) { toast.error("Select an agent"); return; }
    if (!campaignName.trim()) { toast.error("Enter a campaign name"); return; }

    setReaching(true);
    try {
      const res = await peopleApi.reachout({
        agent_id: agentId,
        candidate_ids: Array.from(selected),
        job_description: jd,
        campaign_name: campaignName,
      });
      toast.success(`${res.calls_created} calls initiated!`);
      router.push(`/people-search/campaign/${res.campaign_id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Reachout failed");
    } finally {
      setReaching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            People Search & Reachout
          </h1>
          <p className="text-muted-foreground mt-1">Find candidates, select them, then reach out at scale with Voice AI</p>
        </div>
        <Button asChild variant="outline" className="border-border/50">
          <Link href="/people-search/campaign">
            <BarChart3 className="w-4 h-4 mr-2" />
            Campaigns
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr,380px] gap-6">
        {/* Left: Search */}
        <div className="space-y-6">
          {/* JD Input */}
          <div className="glass rounded-2xl border border-border/50 p-6">
            <Label className="text-sm font-medium text-foreground mb-2 block">Job Description</Label>

            {/* Sample JDs */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SAMPLE_JDS.map(s => (
                <button
                  key={s.label}
                  onClick={() => setJd(s.text)}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/80 text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-foreground transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Paste your job description here... Our AI will find and score matching candidates."
              value={jd}
              onChange={e => setJd(e.target.value)}
              className="bg-accent/50 border-border/50 focus:border-primary min-h-[140px] resize-none text-sm"
            />

            <Button
              onClick={handleSearch}
              disabled={searching}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20 h-11"
            >
              {searching ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching...</>
              ) : (
                <><Search className="w-4 h-4 mr-2" />Find Candidates</>
              )}
            </Button>
          </div>

          {/* Results */}
          {searching && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          )}

          {!searching && searched && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-foreground">{candidates.length} candidates found</h2>
                  {dataSource && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/80 text-muted-foreground border border-border/50">
                      {dataSource === "mock" ? "Demo Data" : "PDL API"}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-primary hover:underline">Select all</button>
                  <span className="text-muted-foreground/30">|</span>
                  <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                </div>
              </div>

              <div className="space-y-3">
                {candidates.map(c => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    selected={selected.has(c.id)}
                    onToggle={() => toggleSelect(c.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Reachout Panel */}
        <div className="space-y-4">
          {/* Selection summary */}
          <div className="glass rounded-2xl border border-border/50 p-5 sticky top-20">
            <h3 className="font-semibold text-foreground mb-4">Reachout Panel</h3>

            <div className="text-center py-4 mb-4 rounded-xl bg-accent/30 border border-border/50">
              <div className="text-3xl font-bold gradient-text">{selected.size}</div>
              <div className="text-sm text-muted-foreground mt-1">candidates selected</div>
            </div>

            <Button
              onClick={openReachout}
              disabled={selected.size === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20 h-11 mb-4"
            >
              <Phone className="w-4 h-4 mr-2" />
              Launch Voice Reachout
            </Button>

            {showReachout && (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Campaign Name</Label>
                  <Input
                    placeholder="e.g. SWE-Sept-2026"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    className="bg-accent/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Voice AI Agent</Label>
                  {loadingAgents ? (
                    <Skeleton className="h-10 rounded-lg" />
                  ) : (
                    <Select value={agentId} onValueChange={v => setAgentId(v || "")}>
                      <SelectTrigger className="bg-accent/50 border-border/50">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Button
                  onClick={handleReachout}
                  disabled={reaching}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 h-11"
                >
                  {reaching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Initiating...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" />Start {selected.size} Calls</>
                  )}
                </Button>
              </div>
            )}

            {/* Recent campaigns link */}
            <Link
              href="/people-search/campaign"
              className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 pt-4 border-t border-border/30"
            >
              View all campaigns
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
