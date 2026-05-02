"use client";

const metrics = [
  ["84", "active leads"],
  ["12", "team tasks"],
  ["6", "missed follow-ups"],
];

const rows = [
  ["Hot lead", "Ravi", "Follow up today", "High"],
  ["Proposal", "Anita", "Waiting 5 days", "Review"],
  ["Inbox", "NEXA", "Draft reply ready", "Ready"],
];

export default function ProductProofSection() {
  return (
    <section className="mx-auto max-w-[1120px] px-5 pb-12 pt-4 md:px-12 md:pb-20">
      <div className="rounded-[22px] border border-white/10 bg-[#101018] p-4 shadow-2xl shadow-black/25 md:p-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070709]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
              <span className="h-3 w-3 rounded-full bg-[#F5A623]" />
              <span className="h-3 w-3 rounded-full bg-[#22D9A0]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A5A1B3]">
              Boss dashboard preview
            </span>
          </div>

          <div className="grid gap-px bg-white/10 md:grid-cols-[0.9fr_1.5fr]">
            <aside className="bg-[#0d0d13] p-5">
              <p className="font-heading text-lg font-bold text-white">Today</p>
              <p className="mt-2 text-sm leading-6 text-[#A5A1B3]">
                NEXA has found the work that needs attention before the day ends.
              </p>
              <div className="mt-6 space-y-3">
                {metrics.map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-heading text-3xl font-extrabold text-white">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#A5A1B3]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>

            <div className="bg-[#13131c] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C6FFF]">
                    Operating view
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-extrabold text-white md:text-3xl">
                    Leads, tasks, inbox, and AI next steps.
                  </h2>
                </div>
                <span className="rounded-full border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]">
                  Updated live
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {["CRM pipeline", "Team work", "NEXA alerts"].map((label) => (
                  <div key={label} className="h-24 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="h-2 w-16 rounded-full bg-[#7C6FFF]/50" />
                    <div className="mt-5 h-2 w-full rounded-full bg-white/10" />
                    <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
                    <p className="mt-4 text-xs font-bold text-[#F0EEF8]">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
                {rows.map(([type, owner, action, status]) => (
                  <div key={`${type}-${owner}`} className="grid gap-3 border-b border-white/10 bg-[#0f0f14] px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_0.8fr_1.4fr_0.8fr]">
                    <span className="font-bold text-white">{type}</span>
                    <span className="text-[#A5A1B3]">{owner}</span>
                    <span className="text-[#F0EEF8]">{action}</span>
                    <span className="font-bold text-[#22D9A0]">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm font-light leading-6 text-[#A5A1B3]">
          Everything your business is doing &mdash; in one place
        </p>
      </div>
    </section>
  );
}
