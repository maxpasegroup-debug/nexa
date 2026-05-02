"use client";

import { useEffect, useMemo, useState } from "react";

import { toast } from "@/components/ui/toast";

export type CustomerRow = {
  id: string;
  clientId: string;
  name: string;
  plan: string;
  status: "TRIAL" | "ACTIVE" | "RENEWAL_FAILED" | "SUSPENDED";
  healthScore: number;
  mrr: number;
  bdmName: string;
  joinedAt: string;
  isChurnRisk: boolean;
};

function queryForFilter(filterKey: string) {
  if (filterKey === "trial") return "status=TRIAL";
  if (filterKey === "churnRisk") return "churnRiskOnly=true";
  if (filterKey === "failedPayment") return "status=RENEWAL_FAILED";
  return "";
}

function statusClass(status: string) {
  if (status === "ACTIVE") return "bg-[#22D9A0]/10 text-[#22D9A0]";
  if (status === "TRIAL") return "bg-[#F5A623]/10 text-[#F5A623]";
  if (status === "RENEWAL_FAILED") return "bg-[#FF6B6B]/10 text-[#FF6B6B]";
  if (status === "SUSPENDED") return "bg-zinc-500/10 text-zinc-400";
  return "bg-zinc-500/10 text-zinc-400";
}

function statusLabel(status: CustomerRow["status"]) {
  if (status === "RENEWAL_FAILED") return "Payment failed";
  return status;
}

function planClass(plan: string) {
  if (plan === "ENTERPRISE") return "bg-teal-400/10 text-teal-200";
  if (plan === "SCALE") return "bg-[#22D9A0]/10 text-[#22D9A0]";
  if (plan === "GROWTH") return "bg-[#7C6FFF]/15 text-[#c8c2ff]";
  if (plan === "TRIAL") return "bg-[#F5A623]/10 text-[#F5A623]";
  return "bg-zinc-500/10 text-zinc-300";
}

function healthColor(score: number) {
  if (score > 70) return "#22D9A0";
  if (score >= 40) return "#F5A623";
  return "#FF6B6B";
}

export function CustomerTable({
  filterKey,
  onCustomerClick,
}: {
  filterKey: string;
  onCustomerClick: (id: string) => void;
}) {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams(queryForFilter(filterKey));
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    const response = await fetch(`/api/internal/customers?${params.toString()}`, { cache: "no-store" });
    const data = (await response.json()) as { customers?: CustomerRow[] };
    setCustomers(data.customers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, status]);

  const title = useMemo(() => {
    const labels: Record<string, string> = {
      all: "All customers",
      trial: "Active trials",
      users: "Customers by users",
      revenue: "Revenue customers",
      churnRisk: "Churn risks",
      failedPayment: "Failed payments",
      ratings: "Customer ratings",
      tickets: "Open tickets",
    };
    return `${labels[filterKey] ?? "Customers"} (${customers.length})`;
  }, [customers.length, filterKey]);

  async function action(id: string, endpoint: string, body?: Record<string, unknown>) {
    const response = await fetch(`/api/internal/customers/${id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? "Action failed");
      return;
    }
    toast.success("Customer updated");
    await load();
  }

  return (
    <section className="rounded-[14px] border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void load()}
            placeholder="Search name or client ID"
            className="rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="RENEWAL_FAILED">Payment failed</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <a href={`/api/internal/customers/export?${queryForFilter(filterKey)}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-black">
            Export CSV
          </a>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="pb-3">Business</th>
              <th className="pb-3">Client ID</th>
              <th className="pb-3">Plan</th>
              <th className="pb-3">Health</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">MRR</th>
              <th className="pb-3">BDM</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-white/5">
                <td className="py-4">
                  <button type="button" onClick={() => onCustomerClick(customer.id)} className="font-bold text-white hover:text-[#7C6FFF]">
                    {customer.name}
                  </button>
                </td>
                <td className="text-xs text-zinc-500">{customer.clientId}</td>
                <td><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${planClass(customer.plan)}`}>{customer.plan}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${customer.healthScore}%`, backgroundColor: healthColor(customer.healthScore) }} />
                    </div>
                    <span>{customer.healthScore}</span>
                  </div>
                </td>
                <td><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(customer.status)}`}>{statusLabel(customer.status)}</span></td>
                <td>₹{Math.round(customer.mrr).toLocaleString("en-IN")}</td>
                <td className="text-zinc-400">{customer.bdmName}</td>
                <td className="text-zinc-500">{new Date(customer.joinedAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <button onClick={() => onCustomerClick(customer.id)} className="rounded-lg bg-[#7C6FFF]/20 px-2 py-1 text-xs text-[#c8c2ff]">View</button>
                    {customer.status === "TRIAL" ? (
                      <>
                        <button onClick={() => void action(customer.id, "convert-trial")} className="rounded-lg bg-[#22D9A0]/20 px-2 py-1 text-xs text-[#22D9A0]">Convert</button>
                        <button onClick={() => void action(customer.id, "extend-trial", { days: 7 })} className="rounded-lg bg-[#F5A623]/20 px-2 py-1 text-xs text-[#F5A623]">Extend</button>
                      </>
                    ) : customer.status === "RENEWAL_FAILED" ? (
                      <button onClick={() => void action(customer.id, "retry-payment")} className="rounded-lg bg-[#FF6B6B]/20 px-2 py-1 text-xs font-bold text-[#FF6B6B]">Retry payment</button>
                    ) : customer.status === "SUSPENDED" ? (
                      <button onClick={() => void fetch(`/api/internal/customers/${customer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ACTIVE" }) }).then(load)} className="rounded-lg bg-[#22D9A0]/20 px-2 py-1 text-xs text-[#22D9A0]">Reinstate</button>
                    ) : (
                      <button onClick={() => onCustomerClick(customer.id)} className="rounded-lg bg-[#22D9A0]/20 px-2 py-1 text-xs text-[#22D9A0]">Edit</button>
                    )}
                    <select
                      onChange={(event) => {
                        const value = event.target.value;
                        event.target.value = "";
                        if (value === "suspend") void action(customer.id, "suspend", { reason: "Owner action" });
                        if (value === "offboard") void action(customer.id, "offboard", { reason: "Owner action" });
                        if (value === "export") window.open(`/api/internal/customers/export?search=${encodeURIComponent(customer.clientId)}`, "_blank");
                      }}
                      className="rounded-lg border border-white/10 bg-[#0d0d12] px-1 py-1 text-xs"
                    >
                      <option value="">⋮</option>
                      <option value="suspend">Suspend account</option>
                      <option value="offboard">Offboard client</option>
                      <option value="export">Export data</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!customers.length ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-zinc-500">
                  {loading ? "Loading customers..." : "No customers match this filter."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
