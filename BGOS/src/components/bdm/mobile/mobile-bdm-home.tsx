"use client";

import Link from "next/link";
import { Phone, MessageCircle, Zap } from "lucide-react";

import type { BdmLead } from "@/components/bdm/my-pipeline";
import type { BdmMetrics } from "@/components/bdm/performance-card";

type MobileBDMHomeProps = {
  user: { id: string; name: string };
  metrics: BdmMetrics;
  brief: { greeting: string; insights: string[]; createdAt: string };
  leads: BdmLead[];
  target: { revenueTarget: number; wonTarget: number };
  commission: { total: number; target: number; progressPct: number };
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function Ring({ value, total }: { value: number; total: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative h-[90px] w-[90px]">
      <svg className="-rotate-90" width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#22D9A0" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-sm font-extrabold text-[#22D9A0]">{money(value)}</span>
        <span className="text-[9px] text-[#6B6878]">of {money(total)}</span>
      </div>
    </div>
  );
}

function statusDot(status: string) {
  if (status === "CONTACTED") return "bg-[#7C6FFF]";
  if (status === "PROPOSAL" || status === "DEMO") return "bg-[#F5A623]";
  if (status === "WON") return "bg-[#22D9A0]";
  if (status === "LOST") return "bg-[#FF6B6B]";
  return "bg-[#3B82F6]";
}

function HotLead({ lead }: { lead: BdmLead }) {
  const phone = lead.phone?.replace(/[^\d+]/g, "");
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-extrabold">{lead.company ?? lead.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-[#6B6878]">{lead.notes ?? lead.scoreReason ?? "No note yet"}</p>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${statusDot(lead.status)}`} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <a href={phone ? `tel:${phone}` : "#"} className="rounded-xl border border-white/[0.08] py-2 text-center text-xs font-bold"><Phone className="mx-auto h-4 w-4" />Call</a>
        <a href={phone ? `https://wa.me/${phone.replace(/[^\d]/g, "")}` : "#"} className="rounded-xl border border-white/[0.08] py-2 text-center text-xs font-bold"><MessageCircle className="mx-auto h-4 w-4" />WhatsApp</a>
        <Link href={`/bdm/onboarding/${lead.id}`} className="rounded-xl bg-[#7C6FFF] py-2 text-center text-xs font-bold text-white"><Zap className="mx-auto h-4 w-4" />Onboard</Link>
      </div>
    </article>
  );
}

export function MobileBDMHome({ user, metrics, brief, leads, target, commission }: MobileBDMHomeProps) {
  const hotLeads = leads.slice(0, 3);
  const targetAmount = commission.target || target.revenueTarget || 30000;
  const pct = Math.min(100, Math.round((commission.total / targetAmount) * 100));

  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 py-4 text-white">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-[13px] font-extrabold">Good morning, {user.name} 👋</h1>
          <p className="mt-1 text-[10px] font-bold text-[#22D9A0]">NEXA briefed you at 8am</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF] font-heading text-xs font-extrabold">
          {user.name.slice(0, 1)}
        </div>
      </header>

      <section className="rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <div className="flex gap-4">
          <Ring value={commission.total} total={targetAmount} />
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-[#7C6FFF]/15 px-3 py-1 text-[11px] font-bold text-[#c6c1ff]">🏆 Growth slab · bonus active</span>
            <p className="mt-3 font-heading text-[22px] font-extrabold text-[#22D9A0]">{pct}%</p>
            <p className="mt-2 rounded-xl bg-[#F5A623]/12 px-3 py-2 text-[11px] font-bold text-[#F5A623]">⚡ Keep closing to unlock the next slab milestone.</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-white/[0.08] bg-[#13131c] p-4"><p className="text-[11px] text-[#6B6878]">Active leads</p><p className="mt-2 font-heading text-2xl font-extrabold text-[#7C6FFF]">{metrics.myLeadsTotal}</p></div>
        <div className="rounded-[14px] border border-white/[0.08] bg-[#13131c] p-4"><p className="text-[11px] text-[#6B6878]">Follow-ups today</p><p className="mt-2 font-heading text-2xl font-extrabold text-[#F5A623]">{metrics.followUpsDueToday}</p></div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#13131c] p-4">
        <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C6FFF] font-heading font-extrabold">N</div><div><p className="font-heading text-xs font-extrabold">NEXA says</p><p className="text-[10px] text-[#6B6878]">today</p></div></div>
        <p className="mt-3 text-xs leading-6 text-[#9b98a8]">{brief.greeting}</p>
        <div className="mt-3 flex gap-2 overflow-x-auto"><span className="rounded-full bg-[#7C6FFF]/15 px-3 py-1.5 text-[11px] font-bold text-[#c6c1ff]">Who first?</span><span className="rounded-full bg-[#22D9A0]/15 px-3 py-1.5 text-[11px] font-bold text-[#22D9A0]">Earnings</span></div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 font-heading text-xs font-extrabold">Hot leads today</h2>
        <div className="space-y-3">{hotLeads.map((lead) => <HotLead key={lead.id} lead={lead} />)}</div>
      </section>
    </main>
  );
}
