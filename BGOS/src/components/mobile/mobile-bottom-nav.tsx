"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Tab = {
  id: string;
  icon: string;
  label: string;
  href: string;
  badge?: "onboarding" | "customers";
};

type MobileBottomNavProps = {
  role?: string | null;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
};

const bdmTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/bdm" },
  { id: "leads", icon: "📋", label: "Leads", href: "/bdm/leads" },
  { id: "onboarding", icon: "🧠", label: "Onboarding", href: "/bdm/onboarding", badge: "onboarding" },
  { id: "customers", icon: "🏢", label: "Customers", href: "/bdm/customers", badge: "customers" },
  { id: "more", icon: "⚙️", label: "More", href: "/bdm/more" },
];

const sdeTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/sde" },
  { id: "tasks", icon: "✅", label: "Tasks", href: "/sde/tasks" },
  { id: "bugs", icon: "Bug", label: "Bugs", href: "/sde/bugs" },
  { id: "builds", icon: "🔧", label: "Builds", href: "/sde/workspaces" },
  { id: "more", icon: "⚙️", label: "More", href: "/sde/more" },
];

const bossTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/boss" },
  { id: "pipeline", icon: "📊", label: "Pipeline", href: "/boss/leads" },
  { id: "team", icon: "👥", label: "Team", href: "/boss/team" },
  { id: "nexa", icon: "🧠", label: "NEXA", href: "/boss/nexa" },
  { id: "more", icon: "⚙️", label: "More", href: "/boss/more" },
];

const internalTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Overview", href: "/internal" },
  { id: "customers", icon: "🏢", label: "Customers", href: "/internal/customers" },
  { id: "pipeline", icon: "📋", label: "Onboarding", href: "/internal/onboarding" },
  { id: "team", icon: "👥", label: "Team", href: "/internal/team" },
  { id: "more", icon: "⚙️", label: "More", href: "/internal/settings" },
];

function tabsForRole(role?: string | null) {
  if (role === "SDE") return sdeTabs;
  if (role === "BOSS" || role === "ADMIN") return bossTabs;
  if (role === "OWNER") return internalTabs;
  return bdmTabs;
}

function isActive(pathname: string, tab: Tab, activeTab?: string) {
  if (activeTab) return tab.id === activeTab;
  if (tab.href === "/bdm" || tab.href === "/sde" || tab.href === "/boss" || tab.href === "/internal") {
    return pathname === tab.href;
  }
  return pathname.startsWith(tab.href);
}

export function MobileBottomNav({ role, activeTab, onTabChange }: MobileBottomNavProps) {
  const pathname = usePathname();
  const tabs = tabsForRole(role);
  const [onboardingCount, setOnboardingCount] = useState(0);
  const [customerAtRiskCount, setCustomerAtRiskCount] = useState(0);

  useEffect(() => {
    if (role !== "BDM") return;

    async function fetchBadges() {
      const [onboardingResponse, customersResponse] = await Promise.all([
        fetch("/api/bdm/leads?status=ONBOARDING", { cache: "no-store" }),
        fetch("/api/bdm/customers", { cache: "no-store" }),
      ]);

      if (onboardingResponse.ok) {
        const data = (await onboardingResponse.json()) as { leads?: unknown[] };
        setOnboardingCount(data.leads?.length ?? 0);
      }

      if (customersResponse.ok) {
        const data = (await customersResponse.json()) as { totalAtRisk?: number };
        setCustomerAtRiskCount(data.totalAtRisk ?? 0);
      }
    }

    function refreshBadges() {
      void fetchBadges();
    }

    void fetchBadges();
    window.addEventListener("bgos:onboarding-updated", refreshBadges);
    const interval = window.setInterval(() => void fetchBadges(), 60_000);
    return () => {
      window.removeEventListener("bgos:onboarding-updated", refreshBadges);
      window.clearInterval(interval);
    };
  }, [role]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[72px] border-t border-white/[0.08] bg-[rgba(13,13,20,0.97)] pb-safe backdrop-blur-[20px] md:hidden">
      {tabs.map((tab) => {
        const active = isActive(pathname, tab, activeTab);
        const badgeCount =
          tab.badge === "onboarding"
            ? onboardingCount
            : tab.badge === "customers"
              ? customerAtRiskCount
              : 0;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            onClick={() => onTabChange?.(tab.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-center transition ${
              active ? "text-[#7C6FFF]" : "text-[#6B6878]"
            }`}
          >
            <span
              className="relative text-[20px] leading-none"
              style={active ? { filter: "drop-shadow(0 0 8px rgba(124,111,255,0.8))" } : undefined}
            >
              {tab.icon}
              {badgeCount > 0 ? (
                <span
                  className={`absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                    tab.badge === "customers" ? "bg-[#FF6B6B] text-white" : "bg-[#22D9A0] text-black"
                  }`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </span>
            <span className="text-[9px] font-bold leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
