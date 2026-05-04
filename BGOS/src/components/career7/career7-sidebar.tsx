"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  Crown,
  GraduationCap,
  House,
  LayoutDashboard,
  Lock,
  MessageSquare,
  PackageOpen,
  Settings,
  ShoppingBag,
  Sparkles,
  Trophy,
  type LucideIcon,
  Wallet,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/career7/dashboard", icon: LayoutDashboard },
  { label: "Growth Board", href: "/career7/growth-board", icon: House },
  { label: "Agent Store", href: "/career7/marketplace", icon: ShoppingBag },
  { label: "My Agents", href: "/career7/marketplace", icon: PackageOpen },
  { label: "Learning", href: "/career7/growth-board", icon: BookOpen },
  { label: "Earning", href: "/career7/wallet", icon: BriefcaseBusiness },
  { label: "Blizzway", href: "/career7/blizzway", icon: Crown, badge: "New" },
  { label: "Programs", href: "/career7/growth-board", icon: Trophy },
  { label: "Assessments", href: "/career7/growth-board", icon: GraduationCap },
  { label: "Wallet & Credits", href: "/career7/wallet", icon: Wallet },
  { label: "Growth Vault", href: "/career7/growth-vault", icon: Lock },
  { label: "Analytics", href: "/career7/dashboard", icon: BarChart3 },
  { label: "Messages", href: "/career7/dashboard", icon: MessageSquare, badge: "5" },
  { label: "Settings", href: "/career7/dashboard", icon: Settings },
  { label: "Help & Support", href: "/career7/dashboard", icon: CircleHelp },
];

type Career7SidebarProps = {
  userName: string;
};

export function Career7Sidebar({ userName }: Career7SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, label: string) => {
    if (label === "Dashboard") return pathname === "/career7/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-full flex-col bg-[#071329] px-4 py-5 text-white shadow-2xl shadow-slate-950/40">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 via-purple-500 to-blue-500 text-xl font-black">
          7
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Career7</h1>
          <p className="text-xs text-slate-400">{userName}</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.label);

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-950/40"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl bg-white/8 p-4 shadow-inner shadow-white/5">
        <p className="text-sm font-semibold">
          Upgrade to <span className="text-fuchsia-300">Premium</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Unlock Blizzway, Premium Agents & more benefits.
        </p>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2.5 text-sm font-bold text-white">
          <Sparkles size={15} />
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
