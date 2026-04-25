"use client";

import { useState } from "react";
import { Bug, Flame, ShieldCheck } from "lucide-react";

import { MetricCard } from "@/components/boss/metric-card";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BugTracker } from "@/components/sde/bug-tracker";
import type { SdeBug, SdeUser } from "@/components/sde/types";

export function SdeBugsPage({ user, initialBugs, teamMembers, metrics }: { user: SdeUser & { businessId: string; businessName: string }; initialBugs: SdeBug[]; teamMembers: SdeUser[]; metrics: { totalOpen: number; critical: number; high: number; resolvedThisWeek: number } }) {
  const [bugs, setBugs] = useState(initialBugs);
  const upsert = (bug: SdeBug) => setBugs((current) => current.some((item) => item.id === bug.id) ? current.map((item) => item.id === bug.id ? bug : item) : [bug, ...current]);
  return <div className="min-h-screen bg-[#070709] pl-[240px] text-white md:pr-[320px]"><Sidebar role="SDE" userName={user.name} businessName={user.businessName} /><Navbar title="Bugs" userName={user.name} /><main className="pt-[60px]"><div className="space-y-6 p-8"><section className="grid gap-4 md:grid-cols-4"><MetricCard title="Total Open" value={metrics.totalOpen} icon={<Bug className="h-4 w-4" />} /><MetricCard title="Critical" value={metrics.critical} icon={<Flame className="h-4 w-4" />} /><MetricCard title="High" value={metrics.high} icon={<Flame className="h-4 w-4" />} /><MetricCard title="Resolved This Week" value={metrics.resolvedThisWeek} icon={<ShieldCheck className="h-4 w-4" />} /></section><BugTracker bugs={bugs} teamMembers={teamMembers} onBugUpdate={upsert} onBugCreate={upsert} /></div></main><NexaPanel businessId={user.businessId} initialMessage="sde_morning_context" /></div>;
}
