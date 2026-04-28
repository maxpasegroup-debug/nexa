"use client";

import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";

type BdeOnboardingProps = {
  user: {
    name: string;
    role: string;
  };
  onComplete: () => void;
};

const whatsappScript =
  "Hi, I wanted to introduce BGOS - an AI-powered business operating system for managing leads, teams, tasks, and customer follow-ups in one workspace. Can I show you how it can help your team this week?";

export function BdeOnboarding({ user, onComplete }: BdeOnboardingProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  async function complete() {
    setSaving(true);
    await fetch("/api/bdm/onboarding", { method: "POST" });
    setSaving(false);
    onComplete();
  }

  const steps = [
    <div key="welcome" className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
        Step 1 of 4
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold">
        Welcome to your BGOS workspace
      </h1>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        Hi {user.name}. You are signed in as a{" "}
        <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2 py-1 text-xs font-bold text-[#c6c1ff]">
          {user.role}
        </span>
        . iceconnect.in is your daily dashboard for leads, calls, targets,
        earnings, and NEXA guidance.
      </p>
    </div>,
    <div key="commission">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
        Step 2 of 4
      </p>
      <h1 className="mt-4 text-center font-heading text-3xl font-bold">
        Your commission structure
      </h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-white/10">
            <tr><td className="p-3 text-zinc-400">Growth first sale</td><td className="p-3 font-bold text-[#22D9A0]">₹1,500</td></tr>
            <tr><td className="p-3 text-zinc-400">Scale first sale</td><td className="p-3 font-bold text-[#22D9A0]">₹3,500</td></tr>
            <tr><td className="p-3 text-zinc-400">Renewal commission</td><td className="p-3 font-bold text-[#7C6FFF]">₹500+</td></tr>
            <tr><td className="p-3 text-zinc-400">Slab bonuses</td><td className="p-3 font-bold text-[#F5A623]">₹3,000 to ₹20,000</td></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-xl border border-[#22D9A0]/25 bg-[#22D9A0]/10 px-4 py-3 text-center font-heading text-xl font-bold text-[#22D9A0]">
        Monthly target: ₹30,000
      </div>
    </div>,
    <div key="task">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
        Step 3 of 4
      </p>
      <h1 className="mt-4 text-center font-heading text-3xl font-bold">
        Your first task from NEXA
      </h1>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        NEXA says: Send the BGOS opening message to 20 contacts in your network
        today. Here is the exact message to use:
      </p>
      <div className="mt-5 rounded-xl border border-white/10 bg-[#0e0e13] p-4 text-sm leading-6 text-zinc-300">
        {whatsappScript}
      </div>
      <button
        type="button"
        onClick={() => void navigator.clipboard?.writeText(whatsappScript)}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white"
      >
        <Copy className="h-4 w-4" />
        Copy message
      </button>
    </div>,
    <div key="ready" className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
        Step 4 of 4
      </p>
      <CheckCircle2 className="mx-auto mt-5 h-16 w-16 text-[#22D9A0]" />
      <h1 className="mt-5 font-heading text-3xl font-bold">You are ready</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Your dashboard is ready. Start with your hottest lead, log every call,
        and let NEXA keep score.
      </p>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070709] px-4 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#13131c] p-6 shadow-2xl shadow-black/40">
        {steps[step]}
        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index <= step ? "bg-[#22D9A0]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void complete()}
              disabled={saving}
              className="rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
            >
              {saving ? "Saving..." : "Go to your dashboard"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
