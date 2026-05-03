"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

type BossWorkLock = {
  id: string;
  targetType: string;
  targetId: string;
  message: string;
  startedAt: string;
  bossName: string;
};

export function BossWorkAlert() {
  const [locks, setLocks] = useState<BossWorkLock[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/boss/work-locks", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json().catch(() => ({}))) as { locks?: BossWorkLock[] };
      setLocks(data.locks ?? []);
    }

    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!locks.length) return null;

  return (
    <div className="mb-4 rounded-xl border border-[#F5A623]/40 bg-[#F5A623]/10 p-4 text-[#ffe3aa]">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-bold">Boss mode active</p>
          <p className="mt-1 text-sm text-[#f7d59a]">
            {locks[0].message} Started by {locks[0].bossName}. Do not update or message on this work until Boss finishes.
          </p>
        </div>
      </div>
    </div>
  );
}
