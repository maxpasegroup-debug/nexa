"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "⚡",
    title: "NEXA AI CEO",
    desc: "Your always-on business brain. Monitors KPIs, assigns work, and keeps your team on track without daily standups.",
    badge: "Most powerful",
  },
  {
    icon: "📊",
    title: "CRM + Lead Engine",
    desc: "Drag-and-drop pipeline, AI lead scoring, automatic follow-up reminders. Never lose a hot lead again.",
  },
  {
    icon: "💬",
    title: "Omni Inbox",
    desc: "WhatsApp, Instagram, Email — one inbox. NEXA auto-replies to FAQs so your team focuses on real conversations.",
    badge: "Phase 2",
  },
  {
    icon: "👥",
    title: "Team Dashboards",
    desc: "Boss, BDM, and SDE each get a role-specific dashboard with daily AI tasks. No confusion, no micromanagement.",
  },
  {
    icon: "🤖",
    title: "AI Employees",
    desc: "Sales AI, HR AI, Marketing AI — agents that work independently, report to NEXA, and never call in sick.",
    badge: "Phase 2",
  },
  {
    icon: "🛒",
    title: "Agent Marketplace",
    desc: "Add GST compliance, Payroll AI, or a Sales Caller bot with one click — like an app store for your business.",
    badge: "Phase 3",
  },
];

function badgeClass(badge?: string) {
  if (badge === "Most powerful") return "bg-[#7C6FFF]/10 text-[#a89fff]";
  if (badge === "Phase 2") return "bg-[#F5A623]/10 text-[#F5A623]";
  return "bg-white/5 text-[#6B6878]";
}

export default function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.18 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="bg-white/[0.015] px-5 py-24 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C6FFF]">
            FEATURES
          </p>
          <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            One platform. Every team.
          </h2>
          <p className="mx-auto mt-4 max-w-[540px] text-base font-light leading-7 text-[#6B6878]">
            Replace 6 different tools with BGOS — built specifically for Indian SMEs.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`bg-[#13131c] p-8 transition hover:bg-[#7C6FFF]/[0.05] ${
                visible ? "animate-[fadeUp_0.7s_ease_forwards]" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C6FFF]/[0.12] text-2xl">
                {feature.icon}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <h3 className="font-heading text-[17px] font-bold text-white">
                  {feature.title}
                </h3>
                {feature.badge ? (
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${badgeClass(feature.badge)}`}>
                    {feature.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-light leading-7 text-[#6B6878]">
                {feature.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
