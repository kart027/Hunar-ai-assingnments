import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Attendance Without Smartphones | Hunar AI Platform",
  description: "How to track attendance for 1000 employees across 100 locations using Voice AI and LLMs — without a single smartphone or app.",
};

import {
  Phone, Mic2, Building2, CheckSquare2, Bell, BarChart3, Shield,
  MessageSquare, Zap, ArrowRight, Brain, Clock, Users, MapPin
} from "lucide-react";

const steps = [
  {
    icon: Building2,
    step: "01",
    title: "Kiosk Registration",
    description: "Each of the 100 locations has a dedicated landline number registered with the system. The kiosk's phone number maps to its location — no GPS, no hardware except a phone.",
    color: "from-violet-600 to-purple-600",
    detail: "100 registered landlines → 100 known locations",
  },
  {
    icon: Phone,
    step: "02",
    title: "Employee Calls In",
    description: "At the start of their shift, an employee picks up the kiosk phone and calls the central attendance number. No app, no smartphone, no QR code — just a standard phone call.",
    color: "from-blue-600 to-cyan-500",
    detail: "Employees call → +91-XXXX-ATTENDANCE",
  },
  {
    icon: Mic2,
    step: "03",
    title: "Voice AI Verifies Identity",
    description: "A Hunar Voice AI agent answers instantly, asks the employee to speak their name and Employee ID. The LLM matches it against the HR database and confirms identity in seconds.",
    color: "from-cyan-500 to-teal-500",
    detail: "LLM verification: Name + Employee ID",
  },
  {
    icon: CheckSquare2,
    step: "04",
    title: "Attendance Logged",
    description: "Identity confirmed → attendance marked PRESENT with timestamp and location (derived from caller ID). The entire system is real-time, updating a central dashboard instantly.",
    color: "from-emerald-500 to-green-600",
    detail: "Present · Location · Timestamp → Database",
  },
  {
    icon: Bell,
    step: "05",
    title: "Absent Employee Callbacks",
    description: "After shift start time, any employee not marked present triggers an automated voice callback. The AI asks for the reason and logs it: leave, sick, absent, or unavailable.",
    color: "from-orange-500 to-red-500",
    detail: "No call-in? → Auto follow-up call",
  },
  {
    icon: Brain,
    step: "06",
    title: "LLM Anomaly Reports",
    description: "Daily, an LLM generates anomaly reports — attendance patterns, location spikes, chronic latecomers, suspicious check-in times — and emails them to HR supervisors automatically.",
    color: "from-pink-600 to-rose-600",
    detail: "AI-generated daily HR intelligence report",
  },
];

const advantages = [
  { icon: Shield, title: "Zero smartphone dependency", desc: "Works with any basic landline" },
  { icon: Zap, title: "Real-time tracking", desc: "Dashboard updates instantly" },
  { icon: Users, title: "Scales to 1000+ employees", desc: "Bulk call handling built-in" },
  { icon: Clock, title: "Automated follow-ups", desc: "No manual HR intervention needed" },
  { icon: BarChart3, title: "LLM analytics", desc: "Daily AI-generated reports" },
  { icon: MessageSquare, title: "Multi-language support", desc: "12+ Indian & global languages" },
];

const flowSteps = [
  { label: "Shift starts", sub: "9:00 AM" },
  { label: "Employee calls kiosk", sub: "Phone call" },
  { label: "AI answers & verifies", sub: "<10 seconds" },
  { label: "Marked present", sub: "Real-time" },
  { label: "Absent → Auto callback", sub: "9:30 AM" },
  { label: "HR report sent", sub: "End of day" },
];

export default function AttendancePage() {
  return (
    <div className="relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium">
            <Brain className="w-3.5 h-3.5" />
            Part 3 — Conceptual Design
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Attendance AI
            <br />
            <span className="gradient-text">Without Smartphones</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            <strong className="text-foreground">The Challenge:</strong> Track attendance for 1,000 employees 
            across 100 locations daily — <em>without smartphones, apps, or the internet</em>. 
            But LLMs and everything else exists.
          </p>
        </div>
      </section>

      {/* The Answer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass rounded-2xl border border-emerald-500/20 p-8 bg-emerald-500/3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">The Answer: Voice AI + IVRS Kiosks</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Deploy a <strong className="text-emerald-400">dedicated landline phone</strong> at each of the 100 locations. 
                Employees call a central number at shift start — a <strong className="text-emerald-400">Hunar Voice AI agent</strong> answers, 
                verifies their identity via voice, and logs attendance automatically. 
                No smartphones. No apps. No internet on the employee side.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">How It Works — End to End</h2>
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {flowSteps.map((step, i) => (
              <div key={i} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1">
                <div className="flex sm:flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-500/50 flex-shrink-0 hidden sm:block" />
                  )}
                </div>
                <div className="sm:text-center">
                  <div className="text-sm font-medium text-foreground">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">6-Step System Design</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, step, title, description, color, detail }) => (
            <div key={step} className="glass rounded-2xl border border-border/50 p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-3xl font-black text-muted-foreground/20">{step}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <div className="text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
                {detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="glass rounded-2xl border border-border/50 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Technology Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Voice AI Agent", tech: "Hunar.AI Voice API", desc: "Natural language identity verification" },
              { label: "IVRS / Telephony", tech: "PSTN + Landlines", desc: "100 location-registered numbers" },
              { label: "LLM Backend", tech: "GPT-4 / Gemini", desc: "Anomaly detection & report generation" },
              { label: "Database", tech: "PostgreSQL", desc: "Real-time attendance records" },
              { label: "Dashboard", tech: "Next.js + React", desc: "Live HR visibility panel" },
              { label: "Notifications", tech: "WhatsApp / Email", desc: "Daily digest to supervisors" },
            ].map(({ label, tech, desc }) => (
              <div key={label} className="rounded-xl bg-accent/30 border border-border/50 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                <div className="font-semibold text-foreground text-sm">{tech}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Why This Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 glass rounded-xl border border-border/50 p-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Considerations box */}
        <div className="glass rounded-2xl border border-yellow-500/20 p-6 mt-6 bg-yellow-500/3">
          <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Edge Cases & Mitigations
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong className="text-foreground">Proxy attendance:</strong> LLM voice fingerprinting + employee ID cross-validation reduces fraud</li>
            <li>• <strong className="text-foreground">Line busy:</strong> 3 callback retries + SMS fallback if call fails</li>
            <li>• <strong className="text-foreground">No landline at location:</strong> Supervisor manually marks via a simple web form</li>
            <li>• <strong className="text-foreground">Data privacy:</strong> Voice verification, not recording — only metadata stored</li>
            <li>• <strong className="text-foreground">Language barrier:</strong> Hunar supports 12+ languages including Hindi, Tamil, Telugu</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
