"use client";

import Link from "next/link";

export type BdmCustomer = {
  id: string;
  clientId?: string | null;
  name: string;
  plan: string;
  monthlyAmount: number;
  status: "TRIAL" | "ACTIVE" | "RENEWAL_FAILED" | "SUSPENDED";
  trialEndsAt?: string | null;
  nextBillingDate?: string | null;
  renewalFailedAt?: string | null;
  gracePeriodEndsAt?: string | null;
  suspendedAt?: string | null;
  totalUsers: number;
  bossName?: string | null;
  bossPhone?: string | null;
  bossEmail?: string | null;
  myCommissionEarned: number;
  myRenewalEarned: number;
  hoursUntilSuspension?: number | null;
  daysUntilTrialExpiry?: number | null;
  daysUntilRenewal?: number | null;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function whatsappHref(phone?: string | null, text?: string) {
  if (!phone) return "#";
  const normalized = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${normalized}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function daysAgo(value?: string | null) {
  if (!value) return "recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function planMeta(customer: BdmCustomer) {
  const plan = customer.status === "TRIAL" ? "Trial" : customer.plan || "Starter";
  if (/scale/i.test(plan)) return { label: "Scale", className: "bg-[#22D9A0]/10 text-[#22D9A0]", price: customer.monthlyAmount };
  if (/growth/i.test(plan)) return { label: "Growth", className: "bg-[#7C6FFF]/12 text-[#a89fff]", price: customer.monthlyAmount };
  if (/trial/i.test(plan)) return { label: "Trial", className: "bg-[#F5A623]/12 text-[#F5A623]", price: 0 };
  return { label: "Starter", className: "bg-white/[0.06] text-zinc-300", price: customer.monthlyAmount };
}

function statusNode(customer: BdmCustomer) {
  if (customer.status === "ACTIVE") {
    return <span className="text-[#22D9A0]"><span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-[#22D9A0]" />Live</span>;
  }
  if (customer.status === "TRIAL") {
    return <span className="text-[#F5A623]"><span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#F5A623]" />Trial · {customer.daysUntilTrialExpiry ?? 0} days left</span>;
  }
  if (customer.status === "RENEWAL_FAILED") {
    return <span className="text-[#FF6B6B]"><span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#FF6B6B]" />Payment failed</span>;
  }
  return <span className="text-zinc-500"><span className="mr-2 inline-flex h-2 w-2 rounded-full bg-zinc-500" />Suspended</span>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <p className={`text-sm font-extrabold ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</p>
    </div>
  );
}

export function CustomerCard({ customer }: { customer: BdmCustomer }) {
  const plan = planMeta(customer);
  const failedMessage = `Hi ${customer.bossName ?? "there"}, I noticed your BGOS payment could not process. Can I help resolve this today?`;
  const urgent = (customer.hoursUntilSuspension ?? 999) < 24;
  const whatsappText = customer.status === "RENEWAL_FAILED" ? failedMessage : undefined;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#101018] p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-[15px] font-bold text-white">{customer.name}</h3>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${plan.className}`}>
            {plan.label} · {plan.price > 0 ? `${money(plan.price)}/mo` : "trial"}
          </span>
        </div>
        <div className="shrink-0 text-right text-xs font-bold">{statusNode(customer)}</div>
      </div>

      {customer.status === "RENEWAL_FAILED" ? (
        <div className="mt-4 rounded-xl border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-3 py-2 text-xs leading-5 text-red-100">
          🔴 Payment failed {daysAgo(customer.renewalFailedAt)}. You have {customer.hoursUntilSuspension ?? 0} hours before access is suspended. Call them now.
          {urgent ? <strong className="ml-2 text-[#FF6B6B]">URGENT</strong> : null}
        </div>
      ) : null}

      {customer.status === "TRIAL" && (customer.daysUntilTrialExpiry ?? 99) <= 3 ? (
        <div className="mt-4 rounded-xl border border-[#F5A623]/25 bg-[#F5A623]/10 px-3 py-2 text-xs leading-5 text-[#ffe2aa]">
          ⏰ Trial ends in {customer.daysUntilTrialExpiry ?? 0} days. Call the boss today — confirm they are happy and autopay is ready.
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
        {customer.status === "ACTIVE" ? (
          <>
            <Stat label="My commission" value={money(customer.myCommissionEarned)} tone="text-[#22D9A0]" />
            <Stat label="Team users" value={String(customer.totalUsers)} tone="text-[#a89fff]" />
            <Stat label="Next renewal" value={`${customer.daysUntilRenewal ?? 0}d`} tone="text-zinc-400" />
          </>
        ) : null}
        {customer.status === "TRIAL" ? (
          <>
            <Stat label="Pending" value={money(customer.monthlyAmount)} tone="text-[#F5A623]" />
            <Stat label="Team users" value={String(customer.totalUsers)} tone="text-[#a89fff]" />
            <Stat label="Trial ends" value={`${customer.daysUntilTrialExpiry ?? 0}d`} tone="text-[#F5A623]" />
          </>
        ) : null}
        {customer.status === "RENEWAL_FAILED" ? (
          <>
            <Stat label="Renewal at risk" value={money(customer.myRenewalEarned)} tone="text-[#FF6B6B]" />
            <Stat label="Team users" value={String(customer.totalUsers)} tone="text-[#a89fff]" />
            <Stat label="Hours left" value={`${customer.hoursUntilSuspension ?? 0}h`} tone="text-[#FF6B6B]" />
          </>
        ) : null}
        {customer.status === "SUSPENDED" ? (
          <>
            <Stat label="Total earned" value={money(customer.myCommissionEarned + customer.myRenewalEarned)} tone="text-zinc-400" />
            <Stat label="Team users" value={String(customer.totalUsers)} tone="text-zinc-500" />
            <Stat label="Suspended" value={daysAgo(customer.suspendedAt)} tone="text-zinc-500" />
          </>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={whatsappHref(customer.bossPhone, whatsappText)}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-xs font-bold text-zinc-200 hover:text-white"
        >
          💬 WhatsApp boss
        </a>
        {customer.status === "RENEWAL_FAILED" ? (
          <a
            href={customer.bossPhone ? `tel:${customer.bossPhone.replace(/[^\d+]/g, "")}` : "#"}
            className="flex-1 rounded-xl border border-[#FF6B6B]/35 bg-[#FF6B6B]/10 px-3 py-2 text-center text-xs font-extrabold text-[#FF6B6B]"
          >
            📞 Call now — urgent
          </a>
        ) : null}
        {customer.status === "SUSPENDED" ? (
          <button
            type="button"
            className="flex-1 rounded-xl bg-[#7C6FFF] px-3 py-2 text-xs font-extrabold text-white"
          >
            Reactivate
          </button>
        ) : null}
        {customer.status === "ACTIVE" || customer.status === "TRIAL" ? (
          <Link
            href="/workspace-preview"
            className="flex-1 rounded-xl bg-white px-3 py-2 text-center text-xs font-extrabold text-black"
          >
            View workspace
          </Link>
        ) : null}
      </div>
    </article>
  );
}
