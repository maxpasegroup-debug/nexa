"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const agentTeasers = [
  { icon: "⚡", name: "Sales Booster", desc: "Lead capture, scoring, and follow-up automation." },
  { icon: "💬", name: "Wazzup", desc: "WhatsApp replies, qualification, and reminders." },
  { icon: "🧾", name: "TaxMate", desc: "Invoices, GST workflows, and finance alerts." },
  { icon: "👥", name: "PeopleDesk", desc: "Attendance, payroll, and team operations." },
];

function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="marketing-shell flex h-16 items-center justify-between">
        <Link href="/" className="marketing-heading text-xl font-extrabold text-white">
          BGOS
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-white/70">
          <Link href="/marketplace" className="transition hover:text-white">
            Marketplace
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="rounded-lg bg-[#7C3AED] px-4 py-2 font-semibold text-white transition hover:bg-[#6D28D9]">
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mx-auto mt-12 max-w-[900px] rounded-2xl border border-white/[0.08] bg-[#0E0E16] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.6)] ${visible ? "mockup-visible" : ""}`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Total Leads</p>
          <p className="mt-2 text-4xl font-extrabold text-[#22D9A0]"><span className="counter counter-leads" /></p>
          <p className="mt-1 text-xs text-white/40">+12 today</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Active Customers</p>
          <p className="mt-2 text-4xl font-extrabold text-[#7C3AED]"><span className="counter counter-customers" /></p>
          <p className="mt-1 text-xs text-white/40">₹94,962 MRR</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Follow-ups Due</p>
          <p className="mt-2 text-4xl font-extrabold text-[#F59E0B]"><span className="counter counter-followups" /></p>
          <p className="mt-1 text-xs text-white/40">3 urgent</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-white">Sales Pipeline</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {["New:24", "Contacted:18", "Follow Up:12", "Quote:8", "Closed:6"].map((item, index) => {
            const [label, count] = item.split(":");
            return (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-3 py-1.5 text-xs font-semibold text-[#c4b5fd]">
                  {label} <b className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-white">{count}</b>
                </span>
                {index < 4 ? <span className="text-white/20">→</span> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl bg-[#7C3AED]/[0.08] p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold">N</div>
        <p className="text-sm leading-6 text-white/70">
          Good morning. You have 3 urgent follow-ups and 2 leads from last night. Want me to handle the follow-ups?
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="marketing-page">
      <MarketingHeader />

      <section className="min-h-screen bg-[#05050A] py-24 md:flex md:items-center">
        <div className="marketing-shell grid items-center gap-14 md:grid-cols-[1fr_480px]">
          <div>
            <span className="marketing-badge">⚡ Powered by NEXA AI</span>
            <h1 className="mt-7 text-[36px] font-extrabold leading-[1.1] text-white md:text-[56px]">
              Meet <span className="bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">NEXA</span>.<br />
              Your Business<br />
              Runs Itself.
            </h1>
            <p className="mt-6 max-w-[480px] text-lg leading-8 text-white/60">
              India&apos;s first AI-powered business operating system. NEXA runs your leads, team, pipelines, and follow-ups — automatically.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="marketing-button-primary">Start Free Trial →</Link>
              <Link href="#how-it-works" className="marketing-button-secondary">See how it works</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-xs text-white/40">
              <span>500+ Businesses</span><span>·</span><span>₹0 Setup</span><span>·</span><span>7-Day Free Trial</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute left-1/2 top-1/2 z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,111,255,0.3),transparent)] blur-[60px]" />
            <Image
              src="/images/nexa.jpeg"
              alt="NEXA AI avatar"
              width={480}
              height={720}
              priority
              className="relative z-10 w-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#080810] py-20">
        <div className="marketing-shell text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a78bfa]">Live Preview</p>
          <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">Your command center. Always live.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/50">This is what your boss dashboard looks like. Real data. Real time.</p>
          <DashboardMockup />
        </div>
      </section>

      <section id="how-it-works" className="bg-[#05050A] py-20">
        <div className="marketing-shell">
          <h2 className="text-center text-3xl font-extrabold text-white md:text-4xl">Set up in minutes. NEXA handles the rest.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["1", "⚡ Tell NEXA about your business", "Answer 10 simple questions. NEXA understands your team, pipeline, and goals."],
              ["2", "🔧 We build your workspace", "Our team configures your custom dashboard in 24 hours."],
              ["3", "🚀 NEXA runs your operations", "Leads, follow-ups, reports, team management — all automated."],
            ].map(([number, title, desc]) => (
              <div key={number} className="marketing-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold">{number}</div>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#080810] py-20">
        <div className="marketing-shell text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">Supercharge with AI Agents</h2>
          <p className="mt-4 text-white/50">Plug in specialized agents for your industry.</p>
          <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
            {agentTeasers.map((agent) => (
              <div key={agent.name} className="agent-store-card">
                <div className="text-3xl">{agent.icon}</div>
                <h3 className="mt-3 text-lg font-bold text-white">{agent.name}</h3>
                <p className="mt-2 text-sm text-white/50">{agent.desc}</p>
                <p className="mt-5 text-sm font-bold text-white">₹999/mo onwards</p>
              </div>
            ))}
          </div>
          <Link href="/marketplace" className="mt-8 inline-flex text-sm font-bold text-[#a78bfa]">View all agents →</Link>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#05050A] to-[#0A0518] py-20">
        <div className="marketing-shell grid items-center gap-12 md:grid-cols-[420px_1fr]">
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="absolute left-1/2 top-1/2 z-0 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,111,255,0.28),transparent)] blur-[50px]" />
            <Image
              src="/images/nexa.jpeg"
              alt="NEXA AI avatar"
              width={360}
              height={540}
              className="relative z-10 w-full"
            />
          </div>
          <div>
            <span className="marketing-badge">Meet NEXA</span>
            <h2 className="mt-5 text-3xl font-extrabold text-white md:text-4xl">Your AI CEO who never sleeps.</h2>
            <div className="mt-7 space-y-4 text-white/70">
              {[
                "Sends morning briefs to your team daily",
                "Follows up with leads automatically",
                "Alerts you when revenue is at risk",
                "Runs your business while you focus on growth",
              ].map((item) => (
                <p key={item} className="flex gap-3"><span className="font-bold text-[#a78bfa]">✓</span>{item}</p>
              ))}
            </div>
            <Link href="/login" className="marketing-button-primary mt-8">Talk to NEXA →</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#030305] py-8">
        <div className="marketing-shell flex flex-col items-center justify-between gap-4 text-sm text-white/40 md:flex-row">
          <p className="marketing-heading font-extrabold text-white">BGOS</p>
          <p>© 2025 BGOS. All rights reserved.</p>
          <div className="flex gap-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        </div>
      </footer>
    </main>
  );
}
