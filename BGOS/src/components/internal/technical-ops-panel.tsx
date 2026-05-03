"use client";

import { useEffect, useState } from "react";
import { Shield, Wrench } from "lucide-react";

type SdeRow = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  tasks: Array<{ id: string; title: string; status: string; priority: string; updatedAt: string }>;
  sdeOnboardingSessions: Array<{
    id: string;
    status: string;
    completenessScore: number;
    companyData: unknown;
    lead: { company: string | null; name: string } | null;
  }>;
  sdeInstallations: Array<{
    id: string;
    status: string;
    agent: { name: string };
    business: { name: string; clientId: string | null };
  }>;
};

function companyName(value: unknown, fallback = "Workspace") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const name = (value as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim()) return name;
  }
  return fallback;
}

export function TechnicalOpsPanel() {
  const [sdes, setSdes] = useState<SdeRow[]>([]);

  async function load() {
    const response = await fetch("/api/internal/technical", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json().catch(() => ({}))) as { sdes?: SdeRow[] };
    setSdes(data.sdes ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function claim(targetType: string, targetId: string, targetUserId: string, label: string) {
    await fetch("/api/internal/technical", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        targetUserId,
        message: `Boss is operating ${label} for technical delivery. SDE must hold actions/messages until Boss finishes.`,
      }),
    });
    await load();
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-[#22D9A0]" />
        <div>
          <h2 className="font-heading text-lg font-bold">Technical department control</h2>
          <p className="mt-1 text-sm text-zinc-500">View SDE builds, integrations, and tasks. Boss can claim work with visible SDE hold alerts.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        {sdes.map((sde) => (
          <div key={sde.id} className="rounded-xl border border-white/10 bg-[#0d0d12] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-white">{sde.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{sde.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${sde.active ? "bg-[#22D9A0]/15 text-[#22D9A0]" : "bg-zinc-500/15 text-zinc-400"}`}>
                {sde.active ? "Active" : "Archived"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs font-bold uppercase text-zinc-500">Workspace builds</p>
                <div className="mt-3 space-y-2">
                  {sde.sdeOnboardingSessions.slice(0, 4).map((session) => {
                    const label = companyName(session.companyData, session.lead?.company ?? session.lead?.name ?? "Workspace");
                    return (
                      <button key={session.id} onClick={() => void claim("ONBOARDING_SESSION", session.id, sde.id, label)} className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-[#F5A623]/10">
                        <Shield className="mr-1 inline h-3 w-3 text-[#F5A623]" /> {label} · {session.status}
                      </button>
                    );
                  })}
                  {!sde.sdeOnboardingSessions.length ? <p className="text-xs text-zinc-600">No active builds.</p> : null}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs font-bold uppercase text-zinc-500">Agent integrations</p>
                <div className="mt-3 space-y-2">
                  {sde.sdeInstallations.slice(0, 4).map((install) => (
                    <button key={install.id} onClick={() => void claim("AGENT_INSTALLATION", install.id, sde.id, `${install.agent.name} for ${install.business.name}`)} className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-[#F5A623]/10">
                      <Shield className="mr-1 inline h-3 w-3 text-[#F5A623]" /> {install.agent.name} · {install.business.name}
                    </button>
                  ))}
                  {!sde.sdeInstallations.length ? <p className="text-xs text-zinc-600">No active integrations.</p> : null}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs font-bold uppercase text-zinc-500">Open tasks</p>
                <div className="mt-3 space-y-2">
                  {sde.tasks.slice(0, 4).map((task) => (
                    <button key={task.id} onClick={() => void claim("TASK", task.id, sde.id, task.title)} className="w-full rounded-lg bg-white/5 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-[#F5A623]/10">
                      <Shield className="mr-1 inline h-3 w-3 text-[#F5A623]" /> {task.title} · {task.status}
                    </button>
                  ))}
                  {!sde.tasks.length ? <p className="text-xs text-zinc-600">No open tasks.</p> : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!sdes.length ? <p className="rounded-xl border border-white/10 p-5 text-center text-sm text-zinc-500">No SDEs found.</p> : null}
      </div>
    </section>
  );
}
