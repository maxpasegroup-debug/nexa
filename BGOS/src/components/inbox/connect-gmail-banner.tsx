"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function ConnectGmailBanner() {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function connectGmail() {
    setLoading(true);
    const response = await fetch("/api/email/connect", { cache: "no-store" });
    setLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { url: string };
    window.location.href = data.url;
  }

  if (dismissed) return null;

  return (
    <section className="rounded-2xl border border-[#7C6FFF]/30 bg-[radial-gradient(circle_at_top_left,rgba(124,111,255,0.18),rgba(19,19,28,0.95)_50%,rgba(19,19,28,0.95))] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black">
            <span className="text-[#4285F4]">G</span>
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              Connect your Gmail to unlock the AI inbox
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
              NEXA will auto-label every email, link them to your leads, and
              draft replies for you.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <button
            type="button"
            onClick={() => void connectGmail()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#7C6FFF] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#9186FF] disabled:opacity-60"
          >
            {loading ? "Connecting..." : "Connect Gmail"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-300"
          >
            Skip for now
          </button>
        </div>
      </div>
    </section>
  );
}
