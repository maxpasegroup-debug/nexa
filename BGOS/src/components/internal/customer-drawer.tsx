"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { toast } from "@/components/ui/toast";

type CustomerProfile = {
  id: string;
  clientId: string | null;
  name: string;
  plan: string;
  status: string;
  healthScore: number;
  mrr: number;
  notes?: string | null;
  joinedAt: string;
  trialEndsAt: string | null;
  bdm?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  users: Array<{ id: string; name: string; email: string; role: string; active: boolean; status: string; lastLoginAt: string }>;
  pipelines: Array<{ id: string; name: string; stages: unknown; leadCount: number }>;
  leadsSummary: { total: number; won: number; open: number };
  supportTickets: Array<{ id: string; title?: string; status?: string; createdAt?: string }>;
  revenue: { mrr: number; totalPaidToDate: number; commissionPaid: number; nextBillingDate: string | null };
  insights: Array<{ id: string; description?: string; type?: string; createdAt: string }>;
  activity: Array<{ id: string; action: string; createdAt: string; user?: { name?: string | null } | null }>;
};

const tabs = ["Overview", "Team", "Pipeline", "Support", "Ratings", "Revenue", "Activity"];

export function CustomerDrawer({
  businessId,
  isOpen,
  onClose,
}: {
  businessId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [tab, setTab] = useState("Overview");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");

  async function load() {
    if (!businessId) return;
    const response = await fetch(`/api/internal/customers/${businessId}`, { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { customer?: CustomerProfile };
    setCustomer(data.customer ?? null);
    setNotes(data.customer?.notes ?? "");
    setName(data.customer?.name ?? "");
  }

  useEffect(() => {
    if (isOpen) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, businessId]);

  if (!isOpen || !businessId) return null;

  async function savePatch(patch: Record<string, unknown>) {
    const response = await fetch(`/api/internal/customers/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return toast.error("Could not update customer");
    toast.success("Customer updated");
    await load();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/50">
      <aside className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-white/10 bg-[#0d0d12] text-white shadow-2xl md:w-[560px]">
        <header className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold">{customer?.name ?? "Loading..."}</h2>
              <p className="mt-1 text-xs text-zinc-500">{customer?.clientId ?? businessId}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full bg-[#7C6FFF]/15 px-2 py-1 text-[10px] font-bold text-[#c8c2ff]">{customer?.plan ?? "PLAN"}</span>
                <span className="rounded-full bg-[#22D9A0]/10 px-2 py-1 text-[10px] font-bold text-[#22D9A0]">{customer?.status ?? "STATUS"}</span>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl border border-white/10 p-2"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void savePatch({ name, notes })} className="rounded-xl bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black">Edit</button>
            <select onChange={(event) => event.target.value && void savePatch({ plan: event.target.value })} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-xs">
              <option value="">Change plan</option>
              <option value="STARTER">Starter</option>
              <option value="GROWTH">Growth</option>
              <option value="SCALE">Scale</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold">Send message</button>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-white/10 p-3">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-full px-3 py-1 text-xs font-bold ${tab === item ? "bg-[#7C6FFF] text-white" : "bg-white/10 text-zinc-400"}`}>{item}</button>
          ))}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!customer ? <p className="text-zinc-500">Loading customer...</p> : null}
          {customer && tab === "Overview" ? (
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-black" style={{ background: `conic-gradient(#22D9A0 ${customer.healthScore}%, rgba(255,255,255,.1) 0)` }}>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0d0d12] text-white">{customer.healthScore}</span>
                </div>
                <div className="grid flex-1 grid-cols-2 gap-3 text-sm">
                  <p>MRR<br /><b>₹{Math.round(customer.mrr).toLocaleString("en-IN")}</b></p>
                  <p>Users<br /><b>{customer.users.length}</b></p>
                  <p>Leads<br /><b>{customer.leadsSummary.total}</b></p>
                  <p>Avg rating<br /><b>—</b></p>
                </div>
              </div>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300">BDM: {customer.bdm?.name ?? "Unassigned"} {customer.bdm?.phone ? <a className="text-[#22D9A0]" href={`https://wa.me/${customer.bdm.phone}`}>WhatsApp</a> : null}</p>
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal notes" className="min-h-28 w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            </div>
          ) : null}
          {customer && tab === "Team" ? <div className="space-y-2">{customer.users.map((user) => <div key={user.id} className="rounded-xl border border-white/10 p-3 text-sm"><b>{user.name}</b><p className="text-zinc-500">{user.role} · {user.email} · {user.active ? "Active" : "Locked"}</p></div>)}</div> : null}
          {customer && tab === "Pipeline" ? <div className="space-y-2">{customer.pipelines.map((pipeline) => <div key={pipeline.id} className="rounded-xl border border-white/10 p-3 text-sm"><b>{pipeline.name}</b><p className="text-zinc-500">{Array.isArray(pipeline.stages) ? pipeline.stages.length : 0} stages · {pipeline.leadCount} leads</p></div>)}</div> : null}
          {customer && tab === "Support" ? <div className="space-y-2">{customer.supportTickets.map((ticket) => <div key={ticket.id} className="rounded-xl border border-white/10 p-3 text-sm"><b>{ticket.title ?? "Ticket"}</b><p className="text-zinc-500">{ticket.status}</p></div>)}</div> : null}
          {customer && tab === "Ratings" ? <p className="text-sm text-zinc-500">No ratings recorded yet.</p> : null}
          {customer && tab === "Revenue" ? <div className="grid gap-3 text-sm"><p>MRR: ₹{Math.round(customer.revenue.mrr).toLocaleString("en-IN")}</p><p>Total paid: ₹{Math.round(customer.revenue.totalPaidToDate).toLocaleString("en-IN")}</p><p>BDM commission: ₹{Math.round(customer.revenue.commissionPaid).toLocaleString("en-IN")}</p><button className="rounded-xl bg-[#F5A623]/20 px-3 py-2 text-[#F5A623]">Retry payment</button></div> : null}
          {customer && tab === "Activity" ? <div className="space-y-2">{[...customer.insights, ...customer.activity].slice(0, 20).map((item) => <div key={item.id} className="rounded-xl border border-white/10 p-3 text-sm"><p>{("description" in item && item.description) || ("action" in item && item.action) || "Activity"}</p></div>)}</div> : null}
        </div>
      </aside>
    </div>
  );
}
