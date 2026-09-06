/**
 * Centralized API client — all requests go through the Next.js rewrite proxy.
 * The Hunar API key is never exposed to the browser.
 */

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error?.detail || error?.message || `API error ${res.status}`);
  }

  return res.json();
}

// ---------- Types ----------

export interface Agent {
  id: string;
  name: string;
  voice_persona?: string;
  persona_name?: string;
  language?: string;
  custom_variables?: string[];
  summary?: string;
  status?: string;
  result_variables?: string[];
  result_schema?: Record<string, string>;
}

export interface CallRecord {
  id: string;
  callee_name: string;
  mobile_number: string;
  agent_id?: string;
  status?: string;
  lifecycle_status?: string;
  duration_minutes?: number;
  engagement_status?: string;
  answered_by?: string;
  call_ended_by?: string;
  recording_url?: string;
  result?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
  request_id?: string;
  source?: string;
  campaign_id?: string;
  job_role?: string;
  created_at?: string;
  updated_at?: string;
  started_at?: string;
  ended_at?: string;
}

export interface Candidate {
  id: string;
  full_name: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  experience_years?: number;
  skills?: string[];
  match_score?: number;
}

export interface Campaign {
  id: string;
  name: string;
  job_description: string;
  total_candidates: number;
  calls_initiated: number;
  created_at?: string;
  calls?: CallRecord[];
}

// ---------- Agents ----------

export const agentsApi = {
  list: () => request<{ count: number; results: Agent[] }>("/agents/"),
  get: (id: string) => request<Agent>(`/agents/${id}`),
};

// ---------- Calls ----------

export const callsApi = {
  create: (body: {
    agent_id: string;
    callee_name: string;
    mobile_number: string;
    custom_data?: Record<string, unknown>;
    request_id?: string;
    from_phone_number?: string;
    job_role?: string;
    source?: string;
  }) => request<CallRecord>("/calls/", { method: "POST", body: JSON.stringify(body) }),

  list: (params?: { source?: string; campaign_id?: string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.source) qs.set("source", params.source);
    if (params?.campaign_id) qs.set("campaign_id", params.campaign_id);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    return request<{ count: number; results: CallRecord[] }>(`/calls/?${qs.toString()}`);
  },

  get: (id: string) => request<CallRecord>(`/calls/${id}`),
  refresh: (id: string) => request<CallRecord>(`/calls/${id}/refresh`, { method: "POST" }),
};

// ---------- People ----------

export const peopleApi = {
  search: (job_description: string, max_results = 20) =>
    request<{ candidates: Candidate[]; total: number; source: string }>("/people/search", {
      method: "POST",
      body: JSON.stringify({ job_description, max_results }),
    }),

  reachout: (body: {
    agent_id: string;
    candidate_ids: string[];
    job_description: string;
    campaign_name: string;
    from_phone_number?: string;
  }) =>
    request<{ campaign_id: string; campaign_name: string; calls_created: number; call_ids: string[] }>(
      "/people/reachout",
      { method: "POST", body: JSON.stringify(body) }
    ),

  listCampaigns: () =>
    request<{ campaigns: Campaign[] }>("/people/campaigns"),

  getCampaign: (id: string) =>
    request<Campaign>(`/people/campaigns/${id}`),
};
