"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    icon: "WATCH",
    title: "NEXA watches the work",
    desc: "Every lead, task, message, and metric is monitored so your team does not depend on memory.",
  },
  {
    number: "02",
    icon: "ACT",
    title: "NEXA recommends action",
    desc: "It scores leads, flags delays, suggests follow-ups, and turns owner decisions into clear team tasks.",
  },
  {
    number: "03",
    icon: "ALERT",
    title: "You see what matters",
    desc: "Owners get a focused view of missed follow-ups, team blockers, and revenue risks before they become problems.",
  },
];

const logs = [
  ["09:14 AM", '-> Assigned lead "Suresh Kumar" to BDM Ravi', "Done"],
  ["09:31 AM", "-> Created follow-up tasks for 8 cold leads", "Done"],
  ["10:02 AM", "-> Health score recalculated: 74 (+12 from last week)", "Done"],
  ["10:45 AM", "-> Escalated unresponsive lead to Boss", "Review"],
  ["11:20 AM", "-> Generated weekly performance report for 3 BDMs", "Done"],
];

export default function NexaDemoSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.25 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="mx-auto max-w-[1100px] px-5 py-24 md:px-12">
      <div className={`text-center ${visible ? "animate-[fadeUp_0.8s_ease_forwards]" : "opacity-0"}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C6FFF]">
          HOW NEXA WORKS
        </p>
        <h2 className="mt-4 font-heading text-4xl font-extrabold text-white md:text-5xl">
          From scattered follow-ups to clear action.
        </h2>
        <p className="mx-auto mt-4 max-w-[540px] text-base font-light leading-7 text-[#A5A1B3]">
          NEXA turns your business activity into simple next steps for owners and teams.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-start md:justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="contents md:flex md:contents-auto md:items-start">
            <article
              className={`max-w-sm flex-1 rounded-2xl border border-white/10 bg-[#13131c] p-7 transition ${
                visible ? "animate-[fadeUp_0.8s_ease_forwards]" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="font-heading text-6xl font-extrabold text-[#7C6FFF]/15">
                {step.number}
              </div>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C6FFF]/15 font-heading text-[10px] font-extrabold text-[#a89fff]">
                {step.icon}
              </div>
              <h3 className="mt-5 font-heading text-lg font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-7 text-[#A5A1B3]">
                {step.desc}
              </p>
            </article>
            {index < steps.length - 1 ? (
              <div className="mt-20 hidden h-px w-20 border-t border-dashed border-[#7C6FFF]/30 md:block" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-white/10 bg-[#0f0f14] p-5 font-mono shadow-2xl shadow-black/20 md:p-7">
        <div className="mb-4 flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
          <span className="h-3 w-3 rounded-full bg-[#F5A623]" />
          <span className="h-3 w-3 rounded-full bg-[#22D9A0]" />
        </div>
        <div className="space-y-3">
          {logs.map(([time, action, result], index) => (
            <div
              key={time}
              className={`flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-xs md:flex-row md:items-center md:justify-between ${
                visible ? "animate-[fadeUp_0.6s_ease_forwards]" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 180 + 300}ms` }}
            >
              <div className="flex min-w-0 gap-3">
                <span className="shrink-0 text-[#22D9A0]">{time}</span>
                <span className="truncate text-white">{action}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${result === "Done" ? "bg-[#22D9A0]/10 text-[#22D9A0]" : "bg-[#F5A623]/10 text-[#F5A623]"}`}>
                {result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
