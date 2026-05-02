"use client";

import Link from "next/link";

import { BOTTOM_NOTE, GST_NOTE, PLAN_ORDER, PLANS, type Plan } from "@/lib/plans";

const teaserAgents = [
  { icon: "⚡", name: "Sales Booster", price: "₹1,499/mo" },
  { icon: "💬", name: "Wazzup", price: "₹999/mo" },
  { icon: "🧾", name: "TaxMate", price: "₹799/mo" },
  { icon: "🏥", name: "CareLoop", price: "₹1,299/mo" },
];

function openNexaWidget() {
  if (typeof window === "undefined") return;

  const nexaWindow = window as Window & {
    openNexaWidget?: () => void;
  };

  if (nexaWindow.openNexaWidget) {
    nexaWindow.openNexaWidget();
  }
}

function StrongDescription({ text }: { text: string }) {
  const phrases = [
    "NEXA as your CEO",
    "NEXA CEO running your business",
    "unlimited pipelines",
    "dedicated success manager",
  ];
  const phrase = phrases.find((item) => text.includes(item));
  if (!phrase) return <>{text}</>;
  const [before, after] = text.split(phrase);
  return (
    <>
      {before}
      <strong className="font-semibold text-[var(--text)]">{phrase}</strong>
      {after}
    </>
  );
}

function ctaClass(plan: Plan) {
  if (plan.ctaStyle === "primary") return "bg-[var(--accent)] text-white";
  if (plan.ctaStyle === "outline-green") {
    return "border border-[#22D9A0]/30 bg-transparent text-[#22D9A0]";
  }
  return "border border-white/10 bg-transparent text-[var(--text)]";
}

function PlanCard({ plan }: { plan: Plan }) {
  const priceColor = plan.highlight ? plan.color : "#F0EEF8";
  const badgeClass =
    plan.name === "Growth"
      ? "border-[#7C6FFF]/25 text-[#a89fff]"
      : plan.name === "Enterprise"
        ? "border-[#22D9A0]/20 text-[#22D9A0]"
        : "border-white/10 text-zinc-300";

  return (
    <article
      className={`relative flex flex-col rounded-[20px] border bg-[var(--card)] p-6 text-left transition duration-200 hover:-translate-y-0.5 ${
        plan.highlight ? "border-[#7C6FFF]/50 bg-[#7C6FFF]/[0.04]" : "border-white/[0.07]"
      }`}
    >
      {plan.highlight && "badge" in plan ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C6FFF] px-3 py-1 text-[10px] font-bold text-white">
          {plan.badge}
        </span>
      ) : null}
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {plan.name}
      </p>
      <div className="mt-4 flex items-end gap-1">
        <span
          className={`font-heading font-extrabold ${plan.name === "Enterprise" ? "text-[28px]" : "text-4xl"}`}
          style={{ color: priceColor }}
        >
          {plan.priceDisplay}
        </span>
        {plan.period ? <span className="pb-1 text-[13px] text-[var(--muted)]">{plan.period}</span> : null}
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted)] opacity-70">{plan.gstNote}</p>
      <div className="my-4 h-px bg-white/[0.07]" />
      <span className={`mb-3 inline-flex w-fit items-center gap-2 rounded-lg border bg-white/[0.04] px-3 py-1.5 text-xs ${badgeClass}`}>
        👥 {plan.usersDisplay}
      </span>
      <p className="mb-4 flex-1 text-[13px] font-light leading-[1.7] text-[var(--muted)]">
        <StrongDescription text={plan.description} />
      </p>
      <ul className="mb-5 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
            <span className="mt-0.5 text-[11px] font-bold text-[#22D9A0]">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={openNexaWidget}
        className={`mt-auto w-full rounded-xl px-4 py-[13px] font-heading text-[13px] font-bold ${ctaClass(plan)}`}
      >
        {plan.cta}
      </button>
    </article>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-[1100px] px-5 py-[60px] text-center md:px-12 md:py-[100px]">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-[#7C6FFF]">
        PRICING
      </p>
      <h2 className="mt-4 text-center font-heading text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1.5px] text-white">
        Simple, honest pricing.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm font-light leading-6 text-[var(--muted)]">
        Every plan includes a custom workspace built by our team. 7-day free trial.
      </p>
      <p className="mt-2 text-center text-[11px] text-[var(--muted)] opacity-70">{GST_NOTE}</p>

      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((key) => (
          <PlanCard key={key} plan={PLANS[key]} />
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-[520px] text-center text-xs leading-[1.7] text-[var(--muted)]">
        {BOTTOM_NOTE.split("custom workspace built by our team")[0]}
        <strong className="font-semibold text-[var(--text)]">custom workspace built by our team</strong>
        {BOTTOM_NOTE.split("custom workspace built by our team")[1].split("7-day free trial")[0]}
        <strong className="font-semibold text-[var(--text)]">7-day free trial</strong>
        {BOTTOM_NOTE.split("7-day free trial")[1]}
      </p>

      <section className="mx-auto mt-8 max-w-[960px] rounded-2xl border border-[#7C6FFF]/15 bg-[#7C6FFF]/[0.04] p-5 text-left">
        <h3 className="font-heading text-base font-bold text-white">Extend with AI agents</h3>
        <p className="mb-4 mt-1 text-xs text-[var(--muted)]">
          Plug-and-play agents for your industry. Set up by our team. Available after subscribing.
        </p>
        <div className="flex flex-wrap gap-3">
          {teaserAgents.map((agent) => (
            <div key={agent.name} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5">
              <p className="font-heading text-[11px] font-bold text-white">
                <span className="mr-2 text-base">{agent.icon}</span>
                {agent.name}
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{agent.price}</p>
            </div>
          ))}
          <Link href="/marketplace" className="rounded-[10px] border border-[#7C6FFF]/20 bg-[var(--card)] px-3.5 py-2.5 font-heading text-[11px] font-bold text-[#7C6FFF]">
            ＋ 6 more agents
          </Link>
        </div>
      </section>
    </section>
  );
}
