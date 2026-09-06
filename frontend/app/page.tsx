import Link from "next/link";
import { Mic2, Users, CalendarCheck, ArrowRight, Zap, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Mic2,
    title: "AI Hiring Assistant",
    description: "Automate candidate screening with voice AI agents that conduct natural conversations, evaluate fit, and deliver structured results.",
    href: "/hiring-assistant",
    gradient: "from-violet-600 to-purple-600",
    glow: "glow",
    stats: "24/7 screening",
  },
  {
    icon: Users,
    title: "People Search & Reachout",
    description: "Find ideal candidates from a global talent pool using AI-powered search, then automatically reach out at scale with personalized voice calls.",
    href: "/people-search",
    gradient: "from-cyan-500 to-blue-600",
    glow: "glow-cyan",
    stats: "Bulk outreach",
  },
  {
    icon: CalendarCheck,
    title: "Attendance AI (No Smartphone)",
    description: "Track 1,000 employees across 100 locations using just voice AI + landlines — no smartphones, no apps, just intelligence.",
    href: "/attendance",
    gradient: "from-emerald-500 to-teal-600",
    glow: "glow-emerald",
    stats: "100 locations",
  },
];

const pillars = [
  { icon: Zap, label: "Instant deployment", desc: "Go live in minutes" },
  { icon: Globe, label: "Multi-language", desc: "12+ languages" },
  { icon: Shield, label: "Secure by design", desc: "Keys never exposed" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium">
            <Mic2 className="w-3.5 h-3.5" />
            Built on Hunar Voice AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
            Hire smarter with
            <br />
            <span className="gradient-text">Voice Intelligence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            An all-in-one AI hiring platform — automate screening calls, discover top talent, 
            and manage distributed workforce attendance without a single app.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 border-0">
              <Link href="/hiring-assistant">
                <Mic2 className="w-4 h-4 mr-2" />
                Start Hiring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border/50 hover:bg-accent/50">
              <Link href="/people-search">
                <Users className="w-4 h-4 mr-2" />
                Search Talent
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, href, gradient, glow, stats }) => (
            <Link key={href} href={href} className="group block">
              <div className={`relative h-full glass rounded-2xl p-6 card-hover border border-border/50 ${glow}`}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Stats pill */}
                <div className="absolute top-6 right-6">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/80 text-muted-foreground border border-border/50">
                    {stats}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {description}
                </p>

                <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all gap-1">
                  Explore
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-2xl border border-border/50 p-8">
          <div className="grid sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
            {pillars.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 py-4 sm:py-0 sm:px-8 first:pl-0 last:pr-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
