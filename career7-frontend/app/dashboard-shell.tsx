import type { ReactNode } from "react";

import {
  Career7Badge,
  Career7Sidebar,
  type Career7NavItem,
} from "@/components/career7";

export const dashboardNavItems: Career7NavItem[] = [
  { label: "Dashboard", href: "/dashboard", badge: "Home" },
  { label: "Growth Board", href: "/growth-board" },
  { label: "Agent Store", href: "/agent-store" },
  { label: "Quick Boosts", href: "/quick-boosts" },
  { label: "Blizzway", href: "/blizzway" },
  { label: "Wallet", href: "/wallet" },
  { label: "Growth Vault", href: "/growth-vault" },
  { label: "Settings", href: "/settings" },
];

const mobileNavItems = [
  { label: "Home", href: "/dashboard" },
  { label: "Board", href: "/growth-board" },
  { label: "Store", href: "/agent-store" },
  { label: "Wallet", href: "/wallet" },
];

type Career7DashboardShellProps = {
  activeHref: string;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function Career7DashboardShell({
  activeHref,
  eyebrow = "AI Career OS",
  title,
  description,
  children,
}: Career7DashboardShellProps) {
  return (
    <main className="c7-shell bg-[#f7f9ff] md:grid md:grid-cols-[280px_1fr]">
      <Career7Sidebar
        items={dashboardNavItems}
        activeHref={activeHref}
        className="hidden md:flex"
        footer={
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">NEXA brief</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/78">
              Build portfolio proof before applying to premium roles.
            </p>
          </div>
        }
      />

      <section className="min-w-0 px-4 pb-24 pt-4 sm:px-6 md:px-8 md:pb-8 md:py-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">
              C7
            </span>
            <div>
              <p className="font-black text-slate-950">Career7</p>
              <p className="text-xs font-semibold c7-muted">Dashboard</p>
            </div>
          </div>
          <Career7Badge tone="cyan">2,400 credits</Career7Badge>
        </div>

        <header className="rounded-[28px] bg-white/86 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Career7Badge tone="indigo" dot>
                {eyebrow}
              </Career7Badge>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-sm leading-6 c7-muted">{description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative min-w-0 sm:w-72">
                <span className="sr-only">Search Career7</span>
                <input
                  placeholder="Search agents, boosts, vault..."
                  className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700">
                  2,400 credits
                </span>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm"
                >
                  !
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                  AK
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden" aria-label="Career7 sections">
          {dashboardNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-black ${
                activeHref === item.href
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {children}

        <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-2 rounded-[24px] border border-slate-200 bg-white/92 p-2 shadow-2xl shadow-slate-950/12 backdrop-blur md:hidden">
          {mobileNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-2 py-3 text-center text-[11px] font-black ${
                activeHref === item.href ? "bg-slate-950 text-white" : "text-slate-500"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}
