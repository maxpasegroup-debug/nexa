"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

type PortfolioStatus = "TRIAL" | "PAYING" | "OVERDUE" | "CHURNED" | "UPGRADED";

type PortfolioCustomer = {
  id: string;
  leadId: string;
  planType: string;
  monthlyValue: number;
  status: PortfolioStatus;
  trialEndsAt: string | Date | null;
  nextRenewalAt: string | Date | null;
  renewalCount: number;
  lead: {
    id: string;
    name: string;
    phone: string | null;
    company: string | null;
  };
};

type PortfolioData = {
  paying: PortfolioCustomer[];
  trial: PortfolioCustomer[];
  overdue: PortfolioCustomer[];
  churned: PortfolioCustomer[];
  summary: {
    totalPaying: number;
    totalTrial: number;
    monthlyRenewalIncome: number;
    atRiskCount: number;
  };
};

type CustomerPortfolioProps = {
  portfolio: PortfolioData;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function dateText(value?: string | Date | null) {
  if (!value) return "No date set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function daysUntil(value?: string | Date | null) {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function planClass(planType: string) {
  if (planType.includes("ENTERPRISE")) return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
  if (planType.includes("SCALE")) return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#b8b2ff]";
  if (planType.includes("GROWTH")) return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
  return "border-white/10 bg-white/[0.04] text-zinc-300";
}

function countdownTone(days: number | null) {
  if (days === null) return "text-zinc-500";
  if (days < 3) return "text-[#FF6B6B]";
  if (days < 7) return "text-[#F5A623]";
  return "text-[#22D9A0]";
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
      <div className="text-3xl">📭</div>
      <p className="mt-3 font-heading text-sm font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function PlanBadge({ planType }: { planType: string }) {
  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${planClass(planType)}`}>
      {planType}
    </span>
  );
}

function whatsappHref(customer: PortfolioCustomer) {
  const phone = customer.lead.phone?.replace(/[^\d+]/g, "");
  const text = encodeURIComponent(
    `Hi ${customer.lead.name}, checking in on your BGOS workspace. Is everything running smoothly?`,
  );
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function CustomerPortfolio({ portfolio }: CustomerPortfolioProps) {
  const [tab, setTab] = useState<"paying" | "trial">("paying");

  const sortedPaying = useMemo(
    () =>
      [...portfolio.paying].sort((a, b) => {
        const aTime = a.nextRenewalAt ? new Date(a.nextRenewalAt).getTime() : Infinity;
        const bTime = b.nextRenewalAt ? new Date(b.nextRenewalAt).getTime() : Infinity;
        return aTime - bTime;
      }),
    [portfolio.paying],
  );

  function convertTrial(customer: PortfolioCustomer) {
    const ok = window.confirm(
      `Mark ${customer.lead.name} as paying and create a commission record?`,
    );
    if (!ok) return;
    window.dispatchEvent(
      new CustomEvent("bde:convert-trial", { detail: { portfolio: customer } }),
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5 text-white">
      <div className="mb-5 flex rounded-xl bg-[#0e0e13] p-1">
        <button
          type="button"
          onClick={() => setTab("paying")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
            tab === "paying" ? "bg-[#22D9A0] text-black" : "text-zinc-500 hover:text-white"
          }`}
        >
          Paying ({portfolio.paying.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("trial")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
            tab === "trial" ? "bg-[#22D9A0] text-black" : "text-zinc-500 hover:text-white"
          }`}
        >
          Trials ({portfolio.trial.length})
        </button>
      </div>

      {tab === "paying" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <span className="font-bold text-[#22D9A0]">
              Monthly renewal income: {money(portfolio.summary.monthlyRenewalIncome)}
            </span>
            <span
              className={
                portfolio.summary.atRiskCount > 0 ? "font-bold text-[#FF6B6B]" : "text-zinc-500"
              }
            >
              At risk: {portfolio.summary.atRiskCount} customers
            </span>
          </div>

          {sortedPaying.length > 0 ? (
            sortedPaying.map((customer) => {
              const renewalDays = daysUntil(customer.nextRenewalAt);
              const renewingSoon = renewalDays !== null && renewalDays <= 7;
              const atRisk = false;
              return (
                <article
                  key={customer.id}
                  className="rounded-xl border border-white/10 bg-[#0e0e13] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-[13px] font-bold text-white">
                        {customer.lead.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {customer.lead.company ?? "No company added"}
                      </p>
                    </div>
                    <PlanBadge planType={customer.planType} />
                  </div>
                  <div className="mt-4 grid gap-2 text-xs md:grid-cols-2">
                    <p className="font-bold text-[#22D9A0]">
                      {money(customer.monthlyValue)} per month
                    </p>
                    <p className="text-zinc-500">Renewed {customer.renewalCount} times</p>
                    <p className="text-zinc-500">
                      Next renewal {dateText(customer.nextRenewalAt)}
                    </p>
                    <p className={atRisk ? "text-[#FF6B6B]" : renewingSoon ? "text-[#F5A623]" : "text-[#22D9A0]"}>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current" />
                      {atRisk ? "At risk" : renewingSoon ? "Renewing soon" : "Active"}
                    </p>
                  </div>
                  <a
                    href={whatsappHref(customer)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#22D9A0]/30 px-3 py-2 text-xs font-bold text-[#22D9A0] transition hover:bg-[#22D9A0]/10"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Check in
                  </a>
                </article>
              );
            })
          ) : (
            <EmptyState
              title="No paying customers yet"
              description="Converted customers will appear here with renewal income and check-in actions."
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.trial.length > 0 ? (
            portfolio.trial.map((customer) => {
              const days = daysUntil(customer.trialEndsAt);
              return (
                <article
                  key={customer.id}
                  className="rounded-xl border border-white/10 bg-[#0e0e13] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-[13px] font-bold text-white">
                        {customer.lead.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {customer.lead.company ?? "No company added"}
                      </p>
                    </div>
                    <PlanBadge planType={customer.planType} />
                  </div>
                  <p className={`mt-4 text-sm font-bold ${countdownTone(days)}`}>
                    {days === null
                      ? "Trial end date not set"
                      : `${Math.max(0, days)} days left in trial`}
                  </p>
                  <button
                    type="button"
                    onClick={() => convertTrial(customer)}
                    className="mt-4 rounded-lg bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#5ee0b0]"
                  >
                    Convert now
                  </button>
                  {days !== null && days <= 3 ? (
                    <p className="mt-3 rounded-lg border border-[#F5A623]/25 bg-[#F5A623]/10 px-3 py-2 text-xs font-semibold text-[#F5A623]">
                      Follow up now - trial ending soon. Call {customer.lead.name} and ask if they are ready to subscribe.
                    </p>
                  ) : null}
                </article>
              );
            })
          ) : (
            <EmptyState
              title="No trials running"
              description="Trial customers will appear here with countdowns and conversion prompts."
            />
          )}
        </div>
      )}
    </section>
  );
}
