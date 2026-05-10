"use client";

import { useEffect, useMemo, useState } from "react";

import { Career7Badge, Career7Card, Career7EmptyState, Career7GradientPanel } from "@/components/career7";
import { getApiErrorMessage, soulVaultApi, type SoulVaultResponse } from "@/lib/api";
import { Career7DashboardShell } from "../dashboard-shell";

function asStringRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string>)
    : {};
}

export function SoulVaultClient() {
  const [data, setData] = useState<SoulVaultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadVault() {
      setLoading(true);
      setError("");
      try {
        const response = await soulVaultApi.getSoulVault();
        if (active) setData(response);
      } catch (caught) {
        if (active) setError(getApiErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVault();

    return () => {
      active = false;
    };
  }, []);

  const vault = data?.vault;
  const answers = asStringRecord(vault?.onboardingAnswers);
  const memories = useMemo(() => {
    if (!vault) return [];

    return [
      ...Object.entries(answers).map(([type, text]) => [type, text] as const),
      ...(vault.dreamGoals ?? []).map((goal) => ["Goal", goal] as const),
    ];
  }, [answers, vault]);
  const board = vault?.visionBoard
    ? [
        ["6 months", vault.visionBoard.sixMonths],
        ["1 year", vault.visionBoard.oneYear],
        ["3 years", vault.visionBoard.threeYears],
        ["5 years", vault.visionBoard.fiveYears],
      ].filter(([, value]) => Boolean(value))
    : [];
  const hasVaultData = Boolean(vault?.vaultItems.length || memories.length || board.length);

  return (
    <Career7DashboardShell
      activeHref="/soul-vault"
      title="Soul Vault"
      description="A private profile for dreams, reflections, growth memory, and vision boards."
    >
      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Secure vault messaging</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Your confidence deserves a home.</h2>
          <p className="mt-4 leading-7 text-white/72">
            Vault content remembers dreams, proof, and becoming inside your Blizzway-scoped BGOS workspace.
          </p>
          <div className="mt-6 rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
            <p className="font-black">Private by tenant scope</p>
            <p className="mt-2 text-sm text-white/70">Encryption is not implemented yet; avoid storing highly sensitive secrets.</p>
          </div>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Private profile</p>
          {loading ? (
            <div className="mt-5 h-32 animate-pulse rounded-2xl bg-slate-100" />
          ) : hasVaultData ? (
            <>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{vault?.digitalProfile?.stage || "Blizzway Explorer"}</h2>
              <p className="mt-3 text-sm leading-6 c7-muted">{vault?.digitalProfile?.summary || "No profile summary saved yet."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(vault?.digitalProfile?.strengths ?? ["Hopeful", "Focused", "Premium path"]).map((item) => (
                  <Career7Badge key={item} tone="slate">{item}</Career7Badge>
                ))}
              </div>
            </>
          ) : (
            <Career7EmptyState
              title="Soul Vault is empty"
              description="Complete onboarding to save your profile, dream goals, and vision board."
              actionLabel="Start onboarding"
              actionHref="/onboarding"
            />
          )}
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.78fr]">
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dreams, goals, reflections</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)
            ) : memories.length ? (
              memories.map(([type, text]) => (
                <div key={`${type}-${text}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Career7Badge tone="cyan">{type}</Career7Badge>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{text}</p>
                </div>
              ))
            ) : (
              <Career7EmptyState title="No memories saved yet" description="Onboarding answers and dream goals will appear here." />
            )}
          </div>
        </Career7Card>
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vision board</p>
          <div className="mt-6 grid gap-3">
            {loading ? (
              [0, 1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)
            ) : board.length ? (
              board.map(([time, item]) => (
                <div key={time} className="rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{time}</p>
                  <p className="mt-2 font-black text-slate-950">{item}</p>
                </div>
              ))
            ) : (
              <Career7EmptyState title="No vision board yet" description="Save a 6 month, 1 year, 3 year, and 5 year vision during onboarding." />
            )}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
