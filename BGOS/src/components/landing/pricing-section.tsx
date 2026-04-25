"use client";

import Link from "next/link";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    monthly: "₹799",
    annual: "₹699",
    cta: "Get started free →",
    href: "/register",
    features: ["3 users", "Basic CRM", "1 WhatsApp number", "Basic NEXA", "Email support"],
  },
  {
    name: "Growth",
    monthly: "₹2499",
    annual: "₹1999",
    cta: "Get started free →",
    href: "/register",
    popular: true,
    features: ["15 users", "Full CRM", "3 WhatsApp numbers", "Full NEXA CEO", "2 AI agents", "Chat support"],
  },
  {
    name: "Scale",
    monthly: "₹6999",
    annual: "₹5499",
    cta: "Start free trial →",
    href: "/register",
    features: ["50 users", "Unlimited leads", "All 5 AI agents", "Full marketplace", "Priority support"],
  },
  {
    name: "Enterprise",
    monthly: "Custom",
    annual: "Custom",
    cta: "Contact us →",
    href: "mailto:hello@bgos.in",
    features: ["Unlimited users", "Custom NEXA training", "Dedicated manager", "SLA guarantee", "On-premise option"],
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-[1120px] px-5 py-24 text-center md:px-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C6FFF]">
        PRICING
      </p>
      <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
        Start small. Scale fast.
      </h2>
      <p className="mx-auto mt-4 max-w-[540px] text-base font-light leading-7 text-[#6B6878]">
        No setup fees. Cancel anytime. +18% GST on all plans.
      </p>

      <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-[#13131c] p-1">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={`rounded-full px-5 py-2 text-sm font-medium ${!annual ? "bg-[#7C6FFF] text-white" : "text-[#6B6878]"}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={`rounded-full px-5 py-2 text-sm font-medium ${annual ? "bg-[#7C6FFF] text-white" : "text-[#6B6878]"}`}
        >
          Annual
        </button>
        {annual ? (
          <span className="ml-2 rounded-full bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]">
            Save 20%
          </span>
        ) : null}
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`relative rounded-[14px] bg-[#13131c] p-7 text-left ${
              tier.popular
                ? "border-2 border-[#7C6FFF]"
                : "border border-white/10"
            }`}
          >
            {tier.popular ? (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C6FFF] px-3 py-1 text-[11px] font-bold text-white">
                Most popular
              </span>
            ) : null}
            <p className="font-heading text-[13px] font-bold uppercase text-[#6B6878]">
              {tier.name}
            </p>
            <div className="mt-5">
              <span className="font-heading text-4xl font-extrabold text-white">
                {annual ? tier.annual : tier.monthly}
              </span>
              {tier.name !== "Enterprise" ? (
                <span className="ml-1 text-[13px] text-[#6B6878]">/month +GST</span>
              ) : null}
            </div>
            <div className="my-6 h-px bg-white/10" />
            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm text-[#F0EEF8]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#22D9A0]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className="mt-8 block w-full rounded-lg bg-[#7C6FFF] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#9186FF]"
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-[#6B6878]">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </section>
  );
}
