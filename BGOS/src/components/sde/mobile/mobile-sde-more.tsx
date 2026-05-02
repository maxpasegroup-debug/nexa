"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const items = [
  { icon: "🏃", label: "Sprint view", href: "/sde/sprint" },
  { icon: "🚨", label: "Escalations", href: "/sde/escalations" },
  { icon: "🔌", label: "Integrations", href: "/sde/integrations" },
  { icon: "⚙️", label: "Settings", href: "/sde/settings" },
];

export function MobileSDEMore() {
  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header>
        <h1 className="font-heading text-lg font-extrabold">More</h1>
        <p className="mt-1 text-[11px] text-[var(--muted)]">SDE tools and settings</p>
      </header>
      <section className="mt-5 overflow-hidden rounded-[18px] border border-white/10 bg-[var(--card)]">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex h-[52px] items-center gap-3 border-b border-white/10 px-4 last:border-b-0">
            <span>{item.icon}</span>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <span className="text-zinc-600">→</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex h-[52px] w-full items-center gap-3 px-4 text-left"
        >
          <span>🚪</span>
          <span className="flex-1 text-sm font-medium text-[#FF6B6B]">Sign out</span>
          <span className="text-zinc-600">→</span>
        </button>
      </section>
    </main>
  );
}
