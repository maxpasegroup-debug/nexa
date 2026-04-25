"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell } from "lucide-react";

type NavbarProps = {
  title: string;
  userName: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar({ title, userName }: NavbarProps) {
  const [hasUnreadInsights, setHasUnreadInsights] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUnreadInsights() {
      const response = await fetch("/api/dashboard/nexa-insights", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { insights?: unknown[] };
      setHasUnreadInsights(Boolean(data.insights?.length));
    }

    void loadUnreadInsights();
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function scrollToInsights() {
    document
      .getElementById("nexa-insights-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="fixed left-[240px] right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(13,13,17,0.8)] px-8 backdrop-blur-[12px]">
      <h1 className="font-heading text-base font-bold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={scrollToInsights}
          className="relative rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:border-[#7C6FFF]/50 hover:text-white"
          aria-label="View NEXA insights"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadInsights ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FF6B6B]" />
          ) : null}
        </button>

        <div className="h-6 w-px bg-white/10" />

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FFF] text-sm font-bold text-white"
            aria-label="Open user menu"
          >
            {initials(userName)}
          </button>

          {isOpen ? (
            <div className="absolute right-0 mt-3 w-40 rounded-xl border border-white/10 bg-[#13131c] p-2 shadow-2xl shadow-black/30">
              <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
                Profile
              </button>
              <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
                Settings
              </button>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
