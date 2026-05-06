"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MailCheck,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { LandingCtaButton } from "./landing-cta-button";

const messages = [
  "Lead conversion dropped 18%. I moved 12 hot leads to today's call list.",
  "Six follow-ups are overdue. I created owner-wise tasks for the BDM team.",
  "Revenue health improved from 62 to 74. Two proposals still need attention.",
  "Three inbox replies are ready. Review them before the day ends.",
];

const signals = [
  { label: "Hot leads", value: "24", tone: "text-[#22D9A0]", icon: Target },
  { label: "Follow-ups", value: "18", tone: "text-[#F5A623]", icon: PhoneCall },
  { label: "Team tasks", value: "12", tone: "text-[#7C6FFF]", icon: Users },
];

const pipeline = [
  { name: "New", count: 38, color: "#7C6FFF" },
  { name: "Contacted", count: 21, color: "#06B6D4" },
  { name: "Proposal", count: 9, color: "#F5A623" },
  { name: "Won", count: 6, color: "#22D9A0" },
];

function OperationsMock() {
  return (
    <div className="landing-up relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[22px] border border-white/10 bg-[#101016] text-left shadow-2xl shadow-black/30 [animation-delay:0.55s]">
      <div className="border-b border-white/10 bg-[#15151f] px-4 py-3 md:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#22D9A0]">
              BGOS live workspace
            </p>
            <h2 className="mt-1 truncate font-heading text-sm font-extrabold text-white md:text-base">
              Boss command center
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-2.5 py-1 text-[10px] font-bold text-[#22D9A0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22D9A0]" />
            Live
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-[0.86fr_1.14fr]">
        <aside className="bg-[#0d0d13] p-4 md:p-5">
          <div className="rounded-2xl border border-white/10 bg-[#14141d] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-400">Business health</p>
              <ArrowUpRight className="h-4 w-4 text-[#22D9A0]" />
            </div>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-heading text-5xl font-extrabold text-white">74</p>
              <p className="pb-2 text-xs font-bold text-[#22D9A0]">+12 this week</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[74%] rounded-full bg-[#22D9A0]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-1">
            {signals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <Icon className={`h-4 w-4 ${signal.tone}`} />
                  <p className="mt-3 font-heading text-xl font-extrabold text-white">{signal.value}</p>
                  <p className="mt-1 text-[10px] font-medium text-zinc-500">{signal.label}</p>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="bg-[#111119] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C6FFF]">
                Sales pipeline
              </p>
              <p className="mt-1 text-sm font-bold text-white">Today&apos;s operating view</p>
            </div>
            <Sparkles className="h-5 w-5 text-[#F5A623]" />
          </div>

          <div className="mt-5 space-y-3">
            {pipeline.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-400">{item.name}</span>
                  <span className="font-bold text-white">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(item.count * 2.2, 100)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/10 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#a89fff]" />
              <p className="text-xs font-bold text-[#F0EEF8]">NEXA action queue</p>
            </div>
            <div className="mt-3 space-y-2">
              {[
                ["Call 5 hot leads before 6 PM", Clock3],
                ["Review 3 inbox drafts", MailCheck],
                ["Resolve proposal follow-ups", CheckCircle2],
              ].map(([label, Icon]) => {
                const RowIcon = Icon as typeof Clock3;
                return (
                  <div key={label as string} className="flex items-center gap-2 text-xs text-zinc-300">
                    <RowIcon className="h-3.5 w-3.5 text-[#22D9A0]" />
                    <span>{label as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const current = messages[index];

    if (typed.length < current.length) {
      const timer = window.setTimeout(
        () => setTyped(current.slice(0, typed.length + 1)),
        28,
      );
      return () => window.clearTimeout(timer);
    }

    const pause = window.setTimeout(() => {
      setFading(true);
      window.setTimeout(() => {
        setTyped("");
        setIndex((value) => (value + 1) % messages.length);
        setFading(false);
      }, 240);
    }, 2600);

    return () => window.clearTimeout(pause);
  }, [index, typed]);

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-white/10 bg-[#070709] px-5 pb-16 pt-[92px] text-center md:px-12 md:pb-20 md:pt-[118px] lg:text-left"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#111119] to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div>
          <div className="landing-fade mx-auto inline-flex max-w-full justify-center rounded-full border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-3.5 py-1 text-center text-xs font-semibold text-[#92f0d0] [animation-delay:0.2s] lg:mx-0">
            CRM, team execution, inbox, and AI decisions
          </div>

          <h1 className="mx-auto mt-7 max-w-[360px] font-heading text-[38px] font-extrabold leading-[1.02] tracking-normal text-white md:max-w-[780px] md:text-[64px] lg:mx-0 lg:max-w-none lg:text-[76px]">
            <span className="landing-up block [animation-delay:0.35s]">
              Run your business
            </span>
            <span className="landing-up block text-[#22D9A0] [animation-delay:0.45s]">
              from one clean dashboard.
            </span>
          </h1>

          <p className="landing-up mx-auto mt-6 max-w-[360px] text-base font-light leading-[1.65] text-[#A5A1B3] [animation-delay:0.58s] md:max-w-[640px] md:text-lg lg:mx-0">
            BGOS gives owners a professional operating system for leads, team tasks,
            customer follow-ups, and daily decisions. NEXA turns the noise into
            precise next steps.
          </p>

          <div className="landing-up mt-8 flex flex-col items-center justify-center gap-3 [animation-delay:0.72s] sm:flex-row lg:justify-start">
            <LandingCtaButton className="rounded-lg bg-[#22D9A0] px-8 py-3.5 text-[15px] font-bold text-black transition hover:-translate-y-0.5 hover:bg-[#41efb8]" />
            <a
              href="#how-it-works"
              className="rounded-lg border border-white/15 px-8 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#22D9A0]/50 hover:text-[#92f0d0]"
            >
              See the workflow
            </a>
          </div>

          <div className="landing-up mx-auto mt-8 w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#111119] p-4 text-left shadow-2xl shadow-black/20 [animation-delay:0.88s] lg:mx-0">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22D9A0]" />
                <span className="font-heading text-sm font-bold text-white">NEXA brief</span>
              </div>
              <span className="text-[11px] font-bold text-[#F5A623]">Updated now</span>
            </div>
            <p
              className={`min-h-[56px] text-sm leading-7 text-[#F0EEF8] transition-opacity duration-300 md:text-[15px] ${
                fading ? "opacity-0" : "opacity-100"
              }`}
            >
              {typed}
              <span className="landing-cursor ml-1 inline-block h-5 w-px translate-y-1 bg-[#22D9A0]" />
            </p>
          </div>
        </div>

        <OperationsMock />
      </div>

      <style jsx>{`
        .landing-up,
        .landing-fade {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }
        .landing-fade {
          animation-name: fadeIn;
        }
        .landing-cursor {
          animation: blink 0.8s step-end infinite;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
