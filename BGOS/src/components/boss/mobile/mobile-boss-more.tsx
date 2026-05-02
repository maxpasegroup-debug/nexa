"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const items = [
  { icon: "📥", label: "Inbox", href: "/boss/inbox" },
  { icon: "📄", label: "Reports", href: "/boss/reports" },
  { icon: "📊", label: "Analytics", href: "/boss/reports" },
  { icon: "🛒", label: "Marketplace", href: "/boss/marketplace" },
  { icon: "⚙️", label: "Settings", href: "/boss/settings" },
];

export function MobileBossMore() {
  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header>
        <h1 className="font-heading text-lg font-extrabold">More</h1>
        <p className="mt-1 text-[11px] text-[var(--muted)]">Reports, settings, and workspace tools.</p>
      </header>

      <section className="mt-5 overflow-hidden rounded-[18px] border border-white/10 bg-[var(--card)]">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="flex h-[52px] items-center gap-3 border-b border-white/10 px-4 last:border-b-0">
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <span className="text-zinc-600">→</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex h-[52px] w-full items-center gap-3 px-4 text-left"
        >
          <span className="text-base">🚪</span>
          <span className="flex-1 text-sm font-medium text-[#FF6B6B]">Sign out</span>
          <span className="text-zinc-600">→</span>
        </button>
      </section>
    </main>
  );
}
