import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "./utils";

export type Career7NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
};

export type Career7SidebarProps = {
  items: Career7NavItem[];
  activeHref?: string;
  footer?: ReactNode;
  className?: string;
};

export function Career7Sidebar({
  items,
  activeHref = "/",
  footer,
  className,
}: Career7SidebarProps) {
  return (
    <aside className={cn("c7-sidebar flex min-h-screen flex-col px-5 py-6", className)}>
      <Link href="/" className="flex items-center gap-3" aria-label="Career7 home">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-indigo-600 shadow-lg shadow-indigo-950/25">
          C7
        </span>
        <span>
          <span className="block text-lg font-black tracking-tight text-white">Career7</span>
          <span className="block text-xs font-semibold text-white/45">AI Career OS</span>
        </span>
      </Link>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("c7-nav-item", active && "c7-nav-item-active")}
              aria-current={active ? "page" : undefined}
            >
              {item.icon ?? <span className="h-2 w-2 rounded-full bg-current opacity-70" />}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] font-black text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        {footer ?? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">NEXA</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/78">
              Your next career action stays visible here.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
