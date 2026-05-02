"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const rows = [
  ["📊", "Analytics", "/bdm/onboarding"],
  ["🛒", "Marketplace leads", "/bdm/marketplace-leads"],
  ["📋", "Download questionnaire", "#download"],
  ["🏆", "My performance", "/bdm/performance"],
  ["🔔", "Notifications", "/bdm"],
  ["⚙️", "Settings", "/bdm/settings"],
];

export function MobileBDMMore() {
  return (
    <main className="mobile-page min-h-screen bg-[#070709] px-4 py-5 text-white">
      <h1 className="font-heading text-xl font-extrabold">More</h1>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#13131c]">
        {rows.map(([icon, label, href]) => href === "#download" ? (
          <button key={label} type="button" onClick={() => window.print()} className="flex h-[52px] w-full items-center gap-3 border-b border-white/[0.06] px-4 text-left text-sm"><span>{icon}</span><span className="flex-1">{label}</span><span>›</span></button>
        ) : (
          <Link key={label} href={href} className="flex h-[52px] items-center gap-3 border-b border-white/[0.06] px-4 text-sm"><span>{icon}</span><span className="flex-1">{label}</span><span>›</span></Link>
        ))}
        <button type="button" onClick={() => void signOut({ callbackUrl: "/login" })} className="flex h-[52px] w-full items-center gap-3 px-4 text-left text-sm text-[#FF6B6B]"><span>🚪</span><span className="flex-1">Sign out</span><span>›</span></button>
      </div>
    </main>
  );
}
