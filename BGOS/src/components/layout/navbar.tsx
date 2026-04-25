"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, Mail } from "lucide-react";

type NavbarProps = {
  title: string;
  userName: string;
  role?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type NexaStatus = {
  label: "NEXA active" | "NEXA idle" | "NEXA offline";
  dotClass: string;
  textClass: string;
};

function getNexaStatus(lastActionAt: string | null): NexaStatus {
  if (!lastActionAt) {
    return {
      label: "NEXA offline",
      dotClass: "bg-zinc-500",
      textClass: "text-zinc-400",
    };
  }

  const ageMs = Date.now() - new Date(lastActionAt).getTime();
  const oneHour = 60 * 60 * 1000;
  const sixHours = 6 * oneHour;

  if (ageMs <= oneHour) {
    return {
      label: "NEXA active",
      dotClass: "bg-[#22D9A0]",
      textClass: "text-[#22D9A0]",
    };
  }

  if (ageMs <= sixHours) {
    return {
      label: "NEXA idle",
      dotClass: "bg-[#F5A623]",
      textClass: "text-[#F5A623]",
    };
  }

  return {
    label: "NEXA offline",
    dotClass: "bg-zinc-500",
    textClass: "text-zinc-400",
  };
}

export function Navbar({ title, userName, role }: NavbarProps) {
  const [hasUnreadInsights, setHasUnreadInsights] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastNexaActionAt, setLastNexaActionAt] = useState<string | null>(null);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nexaStatus = getNexaStatus(lastNexaActionAt);
  const isBoss = role === "BOSS" || role === "ADMIN";

  useEffect(() => {
    if (!isBoss) return;

    async function fetchUnreadEmails() {
      const response = await fetch("/api/email/inbox?unreadOnly=true", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as { unreadCount?: number };
      setUnreadEmailCount(data.unreadCount ?? 0);
    }

    void fetchUnreadEmails();
    const interval = window.setInterval(() => void fetchUnreadEmails(), 120_000);
    return () => window.clearInterval(interval);
  }, [isBoss]);

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
    async function loadNexaStatus() {
      const response = await fetch("/api/nexa/history", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as {
        actions?: Array<{ createdAt: string }>;
      };
      setLastNexaActionAt(data.actions?.[0]?.createdAt ?? null);
    }

    void loadNexaStatus();
    const interval = window.setInterval(() => void loadNexaStatus(), 300_000);

    return () => window.clearInterval(interval);
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
        {isBoss ? (
          <Link
            href="/boss/inbox"
            className="relative rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:border-[#7C6FFF]/50 hover:text-white"
            aria-label="View inbox"
          >
            <Mail className="h-5 w-5" />
            {unreadEmailCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7C6FFF] px-0.5 text-[9px] font-bold text-white">
                {unreadEmailCount > 99 ? "99+" : unreadEmailCount}
              </span>
            ) : null}
          </Link>
        ) : null}

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

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold sm:flex">
          <span className={`relative flex h-2 w-2 rounded-full ${nexaStatus.dotClass}`}>
            {nexaStatus.label === "NEXA active" ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#22D9A0] opacity-60" />
            ) : null}
          </span>
          <span className={nexaStatus.textClass}>{nexaStatus.label}</span>
        </div>

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
