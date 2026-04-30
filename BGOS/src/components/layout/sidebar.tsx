"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  AlertTriangle,
  Bot,
  Bug,
  CheckSquare,
  DollarSign,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Settings,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

type SidebarProps = {
  role: string;
  userName: string;
  businessName: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const roleLinks: Record<string, NavItem[]> = {
  BOSS: [
    { label: "Dashboard", href: "/boss", icon: LayoutDashboard },
    { label: "Leads", href: "/boss/leads", icon: TrendingUp },
    { label: "Inbox", href: "/boss/inbox", icon: Mail },
    { label: "Team", href: "/boss/team", icon: Users },
    { label: "NEXA", href: "/boss/nexa", icon: Bot },
    { label: "Reports", href: "/boss/reports", icon: BarChart3 },
    { label: "Settings", href: "/boss/settings", icon: Settings },
  ],
  BDM: [
    { label: "My Leads", href: "/bdm", icon: Target },
    { label: "Earnings", href: "/bdm/commission", icon: DollarSign },
    { label: "Onboarding", href: "/bdm/onboarding", icon: Users },
    { label: "Tasks", href: "/bdm/tasks", icon: CheckSquare },
    { label: "Performance", href: "/bdm/performance", icon: TrendingUp },
    { label: "Call Log", href: "/bdm/calls", icon: Phone },
    { label: "Settings", href: "/bdm/settings", icon: Settings },
  ],
  SDE: [
    { label: "Tasks", href: "/sde", icon: CheckSquare },
    { label: "Workspace builds", href: "/sde/workspaces", icon: Wrench },
    { label: "Bugs", href: "/sde/bugs", icon: Bug },
    { label: "Sprint", href: "/sde/sprint", icon: GitBranch },
    { label: "Integrations", href: "/sde/integrations", icon: Bot },
    { label: "Escalations", href: "/sde/escalations", icon: AlertTriangle },
    { label: "Settings", href: "/sde/settings", icon: Settings },
  ],
  OWNER: [
    { label: "Overview", href: "/internal", icon: LayoutDashboard },
    { label: "Customers", href: "/internal/customers", icon: Users },
    { label: "My Team", href: "/internal/team", icon: Users },
    { label: "BGOS Leads", href: "/internal/leads", icon: Target },
    { label: "NEXA", href: "/internal/nexa", icon: Bot },
    { label: "Settings", href: "/internal/settings", icon: Settings },
  ],
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleBadgeClass(role: string) {
  if (role === "BOSS") {
    return "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]";
  }

  if (role === "SDE") {
    return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
  }

  return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#b8b2ff]";
}

function isActive(pathname: string, href: string) {
  if (href === "/boss" || href === "/bdm" || href === "/sde" || href === "/internal") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function Sidebar({ role, userName, businessName }: SidebarProps) {
  const pathname = usePathname();
  const links = roleLinks[role] ?? roleLinks.BDM;
  const displayBusinessName =
    businessName.length > 24 ? `${businessName.slice(0, 24)}...` : businessName;
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [earningsTotal, setEarningsTotal] = useState<number | null>(null);
  const [onboardingCount, setOnboardingCount] = useState(0);
  const [pendingBuilds, setPendingBuilds] = useState(0);

  useEffect(() => {
    function toggle() {
      setMobileOpen((value) => !value);
    }

    window.addEventListener("bgos:toggle-sidebar", toggle);
    return () => window.removeEventListener("bgos:toggle-sidebar", toggle);
  }, []);

  useEffect(() => {
    if (role !== "BOSS" && role !== "ADMIN") return;

    async function fetchUnread() {
      const response = await fetch("/api/email/inbox?unreadOnly=true", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      setUnreadCount(data.unreadCount ?? 0);
    }

    void fetchUnread();
    const interval = window.setInterval(() => void fetchUnread(), 120_000);
    return () => window.clearInterval(interval);
  }, [role]);

  useEffect(() => {
    if (role !== "BDM") return;

    async function fetchEarnings() {
      const response = await fetch("/api/commission", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { total?: number };
      setEarningsTotal(data.total ?? 0);
    }

    function refreshEarnings() {
      void fetchEarnings();
    }

    void fetchEarnings();
    window.addEventListener("bgos:commission-created", refreshEarnings);
    const interval = window.setInterval(() => void fetchEarnings(), 60_000);
    return () => {
      window.removeEventListener("bgos:commission-created", refreshEarnings);
      window.clearInterval(interval);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "SDE") return;

    async function fetchPendingBuilds() {
      const response = await fetch("/api/sde/workspaces", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { pendingCount?: number };
      setPendingBuilds(data.pendingCount ?? 0);
    }

    void fetchPendingBuilds();
    const interval = window.setInterval(() => void fetchPendingBuilds(), 60_000);
    return () => window.clearInterval(interval);
  }, [role]);

  useEffect(() => {
    if (role !== "BDM") return;

    async function fetchOnboardingCount() {
      const response = await fetch("/api/bdm/onboarding-leads", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { unsubmittedCount?: number };
      setOnboardingCount(data.unsubmittedCount ?? 0);
    }

    function refreshOnboarding() {
      void fetchOnboardingCount();
    }

    void fetchOnboardingCount();
    window.addEventListener("bgos:onboarding-updated", refreshOnboarding);
    const interval = window.setInterval(() => void fetchOnboardingCount(), 60_000);
    return () => {
      window.removeEventListener("bgos:onboarding-updated", refreshOnboarding);
      window.clearInterval(interval);
    };
  }, [role]);

  return (
    <>
    {mobileOpen ? (
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-40 bg-black/70 md:hidden"
      />
    ) : null}
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-[rgba(255,255,255,0.07)] bg-[#0d0d11] transition-transform md:z-40 md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-white/10 px-6 py-5">
        <div className="font-heading text-xl font-bold tracking-normal">
          <span className="text-white">BG</span>
          <span className="text-[#7C6FFF]">OS</span>
        </div>
        <p className="mt-1 truncate text-[11px] text-zinc-500">
          {displayBusinessName}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          const isInbox = item.href === "/boss/inbox";
          const isEarnings = item.href === "/bdm/commission";
          const isOnboarding = item.href === "/bdm/onboarding";
          const isWorkspaceBuilds = item.href === "/sde/workspaces";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-l-2 border-[#7C6FFF] bg-[rgba(124,111,255,0.12)] text-white"
                  : "text-[#6B6878] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {isInbox && unreadCount > 0 ? (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7C6FFF] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
              {isEarnings && earningsTotal !== null ? (
                <span className="rounded-full bg-[#22D9A0]/15 px-2 py-0.5 text-[10px] font-bold text-[#22D9A0]">
                  ₹{Math.round(earningsTotal).toLocaleString("en-IN")}
                </span>
              ) : null}
              {isOnboarding && onboardingCount > 0 ? (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F5A623] px-1 text-[10px] font-bold text-black">
                  {onboardingCount > 99 ? "99+" : onboardingCount}
                </span>
              ) : null}
              {isWorkspaceBuilds && pendingBuilds > 0 ? (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#22D9A0] px-1 text-[10px] font-bold text-black">
                  {pendingBuilds > 99 ? "99+" : pendingBuilds}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF] text-sm font-bold text-white">
            {initials(userName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">
              {userName}
            </p>
            <span
              className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleBadgeClass(
                role,
              )}`}
            >
              {role}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
}
