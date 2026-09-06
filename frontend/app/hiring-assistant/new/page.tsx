"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { agentsApi, callsApi, type Agent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mic2, Phone, User, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewInterviewPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    agent_id: "",
    callee_name: "",
    mobile_number: "",
    job_role: "",
    company: "",
    custom_notes: "",
    from_phone_number: "",
  });

  useEffect(() => {
    agentsApi.list()
      .then(d => {
        setAgents(d.results.filter(a => a.status === "ACTIVE" || !a.status));
        if (d.results.length > 0) setForm(f => ({ ...f, agent_id: d.results[0].id }));
      })
      .catch(() => toast.error("Could not load agents"))
      .finally(() => setLoadingAgents(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agent_id || !form.callee_name || !form.mobile_number) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const selectedAgent = agents.find(a => a.id === form.agent_id);
      const custom_data: Record<string, string> = {};

      // Populate custom_variables expected by agent
      if (selectedAgent?.custom_variables) {
        for (const v of selectedAgent.custom_variables) {
          if (v === "job_role" || v === "role") custom_data[v] = form.job_role;
          else if (v === "company") custom_data[v] = form.company;
          else if (v === "notes" || v === "custom_notes") custom_data[v] = form.custom_notes;
        }
      }

      const call = await callsApi.create({
        agent_id: form.agent_id,
        callee_name: form.callee_name,
        mobile_number: form.mobile_number,
        custom_data,
        job_role: form.job_role || undefined,
        source: "hiring",
        from_phone_number: form.from_phone_number || undefined,
        request_id: `hiring-${Date.now()}`,
      });

      toast.success(`Call scheduled for ${form.callee_name}!`);
      router.push(`/hiring-assistant/${call.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/hiring-assistant">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        {/* Title */}
        <div className="px-8 py-6 border-b border-border/50 bg-gradient-to-r from-violet-600/5 to-purple-600/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">New AI Interview</h1>
          </div>
          <p className="text-muted-foreground text-sm">Schedule a voice AI screening call with a candidate</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Voice AI Agent <span className="text-red-400">*</span>
            </Label>
            {loadingAgents ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : agents.length === 0 ? (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                No active agents found. Please check your Hunar account.
              </div>
            ) : (
              <Select value={form.agent_id} onValueChange={v => setForm(f => ({ ...f, agent_id: v }))}>
                <SelectTrigger className="bg-accent/50 border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id} className="focus:bg-accent">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.name}</span>
                        {a.language && (
                          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-accent/80 border border-border/50">
                            {a.language}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.agent_id && agents.find(a => a.id === form.agent_id)?.summary && (
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                {agents.find(a => a.id === form.agent_id)?.summary}
              </p>
            )}
          </div>

          {/* Candidate Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Candidate Name <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Priya Sharma"
                value={form.callee_name}
                onChange={e => setForm(f => ({ ...f, callee_name: e.target.value }))}
                className="pl-10 bg-accent/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Mobile Number <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="+91XXXXXXXXXX"
                value={form.mobile_number}
                onChange={e => setForm(f => ({ ...f, mobile_number: e.target.value }))}
                className="pl-10 bg-accent/50 border-border/50 focus:border-primary font-mono"
                required
              />
            </div>
          </div>

          {/* Job Role */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Job Role</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={form.job_role}
                onChange={e => setForm(f => ({ ...f, job_role: e.target.value }))}
                className="pl-10 bg-accent/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Company</Label>
            <Input
              placeholder="e.g. Hunar.AI"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className="bg-accent/50 border-border/50 focus:border-primary"
            />
          </div>

          {/* From Phone (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground text-muted-foreground">
              Caller ID <span className="text-xs font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Leave blank to use org default"
                value={form.from_phone_number}
                onChange={e => setForm(f => ({ ...f, from_phone_number: e.target.value }))}
                className="pl-10 bg-accent/50 border-border/50 focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting || loadingAgents || agents.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/25 h-12 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling Call...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule AI Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
