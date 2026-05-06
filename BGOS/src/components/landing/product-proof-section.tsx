"use client";

import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  MailCheck,
  PhoneCall,
  UserCheck,
} from "lucide-react";

const workstreams = [
  {
    title: "Leads",
    value: "84",
    detail: "24 hot, 18 need follow-up",
    color: "#22D9A0",
    icon: PhoneCall,
  },
  {
    title: "Team",
    value: "12",
    detail: "tasks assigned today",
    color: "#7C6FFF",
    icon: UserCheck,
  },
  {
    title: "Inbox",
    value: "9",
    detail: "draft replies ready",
    color: "#06B6D4",
    icon: MailCheck,
  },
  {
    title: "Revenue",
    value: "₹1.8L",
    detail: "proposal value open",
    color: "#F5A623",
    icon: CircleDollarSign,
  },
];

const priorities = [
  {
    title: "Call Prakash Builders",
    meta: "Hot lead untouched for 22 hours",
    owner: "Ravi",
    status: "Call now",
    tone: "text-[#F5A623]",
    icon: AlertTriangle,
  },
  {
    title: "Send proposal follow-up",
    meta: "Deal value ₹48,000",
    owner: "Anita",
    status: "Draft ready",
    tone: "text-[#22D9A0]",
    icon: MailCheck,
  },
  {
    title: "Review BDM workload",
    meta: "Three leads without next task",
    owner: "Boss",
    status: "Review",
    tone: "text-[#7C6FFF]",
    icon: CalendarCheck2,
  },
];

export default function ProductProofSection() {
  return (
    <section className="border-b border-white/10 bg-[#0a0a0d] px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
            Built for daily control
          </p>
          <h2 className="mt-4 max-w-xl font-heading text-3xl font-extrabold leading-tight text-white md:text-5xl">
            A serious operating view, not another decorative dashboard.
          </h2>
          <p className="mt-5 max-w-lg text-base font-light leading-7 text-[#A5A1B3]">
            BGOS keeps the important work visible: which leads need calls, who owns
            each task, what NEXA recommends, and where revenue is stuck.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["No broken media", "Interface-first design"],
              ["Mobile ready", "Dense but readable"],
              ["Owner focused", "Only what matters"],
              ["Team aligned", "Every action has an owner"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <CheckCircle2 className="h-4 w-4 text-[#22D9A0]" />
                <p className="mt-3 text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#101016] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#15151f] px-4 py-3 md:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Today&apos;s command board
              </p>
              <p className="mt-1 text-sm font-bold text-white">Wednesday operations</p>
            </div>
            <span className="rounded-full border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-3 py-1 text-[10px] font-bold text-[#22D9A0]">
              Healthy
            </span>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-4">
            {workstreams.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#0d0d13] p-4">
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                  <p className="mt-4 font-heading text-2xl font-extrabold text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-zinc-300">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-500">{item.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-white">Priority queue</h3>
              <span className="text-[11px] font-bold text-[#F5A623]">3 decisions</span>
            </div>

            <div className="space-y-3">
              {priorities.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Icon className={`h-4 w-4 ${item.tone}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.meta}</p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400">Owner: {item.owner}</span>
                    <span className={`text-xs font-bold ${item.tone}`}>{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
