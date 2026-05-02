"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: "AI",
    title: "NEXA daily intelligence",
    desc: "NEXA watches your CRM, team activity, and follow-ups so owners can see what needs attention today.",
    badge: "Core",
  },
  {
    icon: "CRM",
    title: "CRM + lead engine",
    desc: "Manage pipelines, score leads, assign owners, and keep every hot opportunity moving.",
  },
  {
    icon: "IN",
    title: "Business inbox",
    desc: "Bring email follow-ups into the same operating view so leads and conversations stay connected.",
  },
  {
    icon: "TM",
    title: "Team dashboards",
    desc: "Boss, BDM, and SDE users get role-specific dashboards with the tasks and metrics they need.",
  },
  {
    icon: "AE",
    title: "AI agents",
    desc: "Add focused assistants for sales, marketing, operations, and support as your workspace grows.",
    badge: "Coming next",
  },
  {
    icon: "MP",
    title: "Agent marketplace",
    desc: "Install business-specific agents with setup support from the BGOS team.",
    badge: "Marketplace",
  },
];

function badgeClass(badge?: string) {
  if (badge === "Core") return "bg-[#7C6FFF]/10 text-[#a89fff]";
  if (badge === "Coming next") return "bg-[#F5A623]/10 text-[#F5A623]";
  return "bg-white/5 text-[#A5A1B3]";
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
          <h2 className="mt-4 font-heading text-4xl font-extrabold text-white md:text-5xl">
            One operating view for your team.
          </h2>
          <p className="mx-auto mt-4 max-w-[540px] text-base font-light leading-7 text-[#A5A1B3]">
            Replace scattered spreadsheets, inboxes, and follow-up lists with a focused dashboard built for Indian SMEs.
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C6FFF]/[0.12] font-heading text-sm font-extrabold text-[#a89fff]">
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
              <p className="mt-3 text-sm font-light leading-7 text-[#A5A1B3]">
                {feature.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
