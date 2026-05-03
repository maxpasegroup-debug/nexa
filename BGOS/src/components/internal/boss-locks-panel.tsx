"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

type Lock = {
  id: string;
  targetType: string;
  targetId: string;
  targetRole: string;
  message: string;
  startedAt: string;
  bossName: string;
};

export function BossLocksPanel() {
  const [locks, setLocks] = useState<Lock[]>([]);

  async function load() {
    const response = await fetch("/api/boss/work-locks?all=true", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json().catch(() => ({}))) as { locks?: Lock[] };
    setLocks(data.locks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function finish(id: string) {
    const response = await fetch(`/api/boss/work-locks/${id}`, { method: "PATCH" });
    if (!response.ok) return;
    await load();
  }

  if (!locks.length) return null;

  return (
    <section className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-5 text-[#ffe3aa]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="font-heading text-lg font-bold">Active Boss mode locks</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {locks.map((lock) => (
          <div key={lock.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F5A623]/20 bg-black/20 p-3">
            <div>
              <p className="text-sm font-bold">{lock.targetRole} hold · {lock.targetType}</p>
              <p className="mt-1 text-xs text-[#f7d59a]">{lock.message}</p>
            </div>
            <button onClick={() => void finish(lock.id)} className="rounded-xl bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black">
              Boss finished
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
