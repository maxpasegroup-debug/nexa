"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

type TabletSidebarProps = {
  role?: string | null;
};

type Tab = {
  id: string;
  icon: string;
  label: string;
  href: string;
};

const bdmTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/bdm" },
  { id: "leads", icon: "📋", label: "Leads", href: "/bdm/leads" },
  { id: "earnings", icon: "💰", label: "Earnings", href: "/bdm/commission" },
  { id: "nexa", icon: "🧠", label: "NEXA", href: "/bdm/nexa" },
  { id: "more", icon: "⚙️", label: "More", href: "/bdm/settings" },
];

const sdeTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/sde" },
  { id: "tasks", icon: "✅", label: "Tasks", href: "/sde/tasks" },
  { id: "bugs", icon: "🐛", label: "Bugs", href: "/sde/bugs" },
  { id: "builds", icon: "🔧", label: "Builds", href: "/sde/workspaces" },
  { id: "more", icon: "⚙️", label: "More", href: "/sde/settings" },
];

const bossTabs: Tab[] = [
  { id: "home", icon: "🏠", label: "Home", href: "/boss" },
  { id: "pipeline", icon: "📊", label: "Pipeline", href: "/boss/leads" },
  { id: "team", icon: "👥", label: "Team", href: "/boss/team" },
  { id: "nexa", icon: "🧠", label: "NEXA", href: "/boss/nexa" },
  { id: "more", icon: "⚙️", label: "More", href: "/boss/marketplace" },
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

function isActive(pathname: string, tab: Tab) {
  if (tab.href === "/bdm" || tab.href === "/sde" || tab.href === "/boss" || tab.href === "/internal") {
    return pathname === tab.href;
  }
  return pathname.startsWith(tab.href);
}

export function TabletSidebar({ role }: TabletSidebarProps) {
  const pathname = usePathname();
  const tabs = tabsForRole(role);

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-14 flex-col items-center gap-1 border-r border-white/[0.07] bg-[#0f0f14] py-3 md:flex lg:hidden">
      <Link href="/" className="mb-3 font-heading text-[11px] font-extrabold text-[#7C6FFF]" title="BGOS">
        BG
      </Link>
      <nav className="flex flex-1 flex-col items-center gap-1">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              title={tab.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                active ? "bg-[#7C6FFF]/15 text-white" : "text-[#6B6878] hover:bg-white/[0.04]"
              }`}
            >
              {tab.icon}
            </Link>
          );
        })}
      </nav>
      <Link href={role === "OWNER" ? "/internal/settings" : role === "SDE" ? "/sde/settings" : role === "BOSS" ? "/boss/settings" : "/bdm/settings"} title="Settings" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6B6878] hover:bg-white/[0.04]">
        <Settings className="h-4 w-4" />
      </Link>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C6FFF] font-heading text-xs font-extrabold text-white">
        U
      </div>
    </aside>
  );
}
