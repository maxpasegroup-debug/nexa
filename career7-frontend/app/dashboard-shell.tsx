import type { ReactNode } from "react";
import Link from "next/link";

import {
  Career7Badge,
  Career7AuthBoundary,
  Career7Sidebar,
  NexaAssistant,
  type Career7NavItem,
} from "@/components/career7";

export const dashboardNavItems: Career7NavItem[] = [
  { label: "Dashboard", href: "/dashboard", badge: "Home" },
  { label: "Agent Store", href: "/agent-store" },
  { label: "Quick Boosts", href: "/quick-boosts" },
  { label: "Growth Board", href: "/growth-board" },
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

const nexaEnabledRoutes = new Set([
  "/dashboard",
  "/growth-board",
  "/agent-store",
  "/quick-boosts",
  "/blizzway",
  "/wallet",
  "/growth-vault",
]);

type Career7DashboardShellProps = {
  activeHref: string;
  eyebrow?: string;
  title: string;
  description: string;
  userName?: string;
  walletCredits?: number | null;
  breadcrumbs?: { label: string; href?: string }[];
  children: ReactNode;
};

export function Career7DashboardShell({
  activeHref,
  eyebrow = "AI Career OS",
  title,
  description,
  userName = "Career7 User",
  walletCredits,
  breadcrumbs,
  children,
}: Career7DashboardShellProps) {
  const activeItem = dashboardNavItems.find((item) => item.href === activeHref);
  const shellBreadcrumbs = breadcrumbs ?? [
    { label: "Career7", href: "/dashboard" },
    { label: activeItem?.label ?? title },
  ];

  return (
    <Career7AuthBoundary>
    <main className="c7-shell overflow-x-hidden bg-[#f7f9ff] md:grid md:grid-cols-[280px_1fr]">
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

      <section className="w-full min-w-0 max-w-[100vw] overflow-x-hidden px-4 pb-24 pt-4 sm:px-6 md:max-w-full md:px-8 md:pb-8 md:py-6 lg:px-10">
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
        </div>

        <header className="rounded-[28px] bg-white/86 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black text-slate-400" aria-label="Breadcrumb">
                {shellBreadcrumbs.map((crumb, index) => (
                  <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                    {index > 0 ? <span className="text-slate-300">/</span> : null}
                    {crumb.href ? (
                      <Link href={crumb.href} className="transition hover:text-indigo-600">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-600">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
              <Career7Badge tone="indigo" dot>{eyebrow}</Career7Badge>
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
                <span className="rounded-full bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-700 sm:px-4">
                  {walletCredits === null || walletCredits === undefined
                    ? "Credits loading"
                    : `${walletCredits.toLocaleString()} credits`}
                </span>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm"
                >
                  !
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                  {userName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "C7"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-2 md:hidden" aria-label="Career7 sections">
          {dashboardNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-black transition active:scale-[0.98] ${
                activeHref === item.href
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="c7-page-enter">{children}</div>

        <nav
          className="fixed bottom-3 z-30 grid grid-cols-4 gap-2 overflow-hidden rounded-[24px] border border-slate-200 bg-white/92 p-2 shadow-2xl shadow-slate-950/12 backdrop-blur md:hidden"
          style={{ left: "0.75rem", width: "calc(100vw - 1.5rem)" }}
        >
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-0 truncate rounded-2xl px-1 py-3 text-center text-[11px] font-black transition active:scale-[0.98] ${
                activeHref === item.href ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {nexaEnabledRoutes.has(activeHref) ? <NexaAssistant /> : null}
      </section>
    </main>
    </Career7AuthBoundary>
  );
}
