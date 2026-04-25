"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { IntegrationHealth } from "@/components/sde/integration-health";
import type { IntegrationHealthItem, SdeEscalation } from "@/components/sde/types";

export function SystemHealth() {
  const [integrations, setIntegrations] = useState<IntegrationHealthItem[]>([]);
  const [openEscalations, setOpenEscalations] = useState(0);
  const [criticalBugs, setCriticalBugs] = useState(0);

  useEffect(() => {
    async function load() {
      const [integrationResponse, escalationResponse, bugResponse] = await Promise.all([
        fetch("/api/sde/integrations", { cache: "no-store" }),
        fetch("/api/sde/escalations?status=OPEN", { cache: "no-store" }),
        fetch("/api/sde/bugs?severity=CRITICAL&status=OPEN", { cache: "no-store" }),
      ]);
      if (integrationResponse.ok) {
        setIntegrations(((await integrationResponse.json()) as { integrations: IntegrationHealthItem[] }).integrations);
      }
      if (escalationResponse.ok) {
        setOpenEscalations(((await escalationResponse.json()) as { escalations: SdeEscalation[] }).escalations.length);
      }
      if (bugResponse.ok) {
        setCriticalBugs(((await bugResponse.json()) as { bugs: unknown[] }).bugs.length);
      }
    }
    void load();
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <h2 className="mb-5 font-heading text-base font-bold text-white">System Health</h2>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <IntegrationHealth integrations={integrations} compact />
        <div className="space-y-3">
          <Link href="/sde/escalations" className="block rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <p className="text-xs text-zinc-500">Open escalations</p>
            <p className="mt-2 font-heading text-3xl font-bold text-[#F5A623]">{openEscalations}</p>
          </Link>
          <Link href="/sde/bugs" className="block rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <p className="text-xs text-zinc-500">Open critical bugs</p>
            <p className="mt-2 font-heading text-3xl font-bold text-[#FF6B6B]">{criticalBugs}</p>
          </Link>
          <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <p className="text-xs text-zinc-500">Last deployment time</p>
            <p className="mt-2 text-sm font-semibold text-white">No deployments logged</p>
          </div>
        </div>
      </div>
    </section>
  );
}
