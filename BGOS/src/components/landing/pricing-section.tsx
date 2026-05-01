"use client";

import Link from "next/link";

type Plan = {
  name: string;
  price: string;
  featured: boolean;
  features: Array<[string, boolean]>;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₹799",
    featured: false,
    features: [
      ["Up to 3 users", true],
      ["1 custom pipeline", true],
      ["NEXA AI (basic insights)", true],
      ["500 leads/month", true],
      ["Email inbox", true],
      ["Boss dashboard", true],
      ["Email support", true],
    ],
  },
  {
    name: "Growth",
    price: "₹2,499",
    featured: true,
    features: [
      ["Up to 15 users", true],
      ["3 custom pipelines", true],
      ["NEXA AI CEO (full)", true],
      ["5,000 leads/month", true],
      ["All role dashboards", true],
      ["Email + chat support", true],
      ["Marketplace access", true],
      ["Smart automations", true],
    ],
  },
  {
    name: "Scale",
    price: "₹6,999",
    featured: false,
    features: [
      ["Up to 50 users", true],
      ["Unlimited pipelines", true],
      ["NEXA AI CEO (advanced)", true],
      ["Unlimited leads", true],
      ["All dashboards + API", true],
      ["Priority support (4hr)", true],
      ["Full marketplace", true],
      ["Data export", true],
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    featured: false,
    features: [
      ["Unlimited users", true],
      ["Custom NEXA training", true],
      ["Dedicated success manager", true],
      ["SLA 99.9% guarantee", true],
      ["White label option", true],
      ["All marketplace agents free", true],
      ["Custom integrations", true],
    ],
  },
];

const teaserAgents = [
  { icon: "⚡", name: "Sales Booster", price: "₹1,499/mo" },
  { icon: "💬", name: "Wazzup", price: "₹999/mo" },
  { icon: "🧾", name: "TaxMate", price: "₹799/mo" },
];

declare global {
  interface Window {
    openNexaWidget?: () => void;
  }
}

function openNexa() {
  window.openNexaWidget?.();
}

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24 text-center md:px-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C6FFF]">
        PRICING
      </p>
      <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
        Start with BGOS. Extend when ready.
      </h2>
      <p className="mx-auto mt-4 max-w-[560px] text-base font-light leading-7 text-[#6B6878]">
        Clean subscription plans with autopay. Marketplace agents can be installed after your workspace is active.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative rounded-[14px] bg-[#13131c] p-7 text-left ${
              plan.featured ? "border-2 border-[#7C6FFF]" : "border border-white/10"
            }`}
          >
            {plan.featured ? (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C6FFF] px-3 py-1 text-[11px] font-bold text-white">
                Most popular
              </span>
            ) : null}
            <p className="font-heading text-[13px] font-bold uppercase text-[#6B6878]">
              {plan.name}
            </p>
            <div className="mt-5">
              <span className="font-heading text-4xl font-extrabold text-white">
                {plan.price}
              </span>
              {plan.name !== "Enterprise" ? (
                <span className="ml-1 text-[13px] text-[#6B6878]">/mo</span>
              ) : null}
            </div>
            <p className="mt-2 text-[11px] text-[#6B6878]">
              + 18% GST · autopay
            </p>
            <div className="my-6 h-px bg-white/10" />
            <ul className="space-y-3">
              {plan.features.map(([feature, included]) => (
                <li key={feature} className="flex gap-3 text-sm text-[#F0EEF8]">
                  <span
                    className={`mt-2 h-1.5 w-1.5 rounded-full ${
                      included ? "bg-[#22D9A0]" : "bg-zinc-600"
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={openNexa}
              className="mt-8 block w-full rounded-lg bg-[#7C6FFF] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#9186FF]"
            >
              Get your free workspace →
            </button>
            <p className="mt-3 text-center text-[11px] text-[#6B6878]">
              7-day free trial · Custom setup by our team
            </p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-[#13131c] p-5 text-left">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Extend with AI agents
            </h3>
            <p className="mt-1 text-[13px] text-[#6B6878]">
              Install after subscribing. Each agent set up by our team in 24 hours.
            </p>
          </div>
          <Link href="/marketplace" className="text-sm font-bold text-[#7C6FFF]">
            View all agents →
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {teaserAgents.map((agent) => (
            <div key={agent.name} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <p className="font-heading text-sm font-bold text-white">{agent.name}</p>
                  <p className="mt-0.5 text-xs text-[#22D9A0]">{agent.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
