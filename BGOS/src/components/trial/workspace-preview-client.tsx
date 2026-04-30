"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WorkspaceConfig = {
  id: string;
  companyName: string;
  products: unknown;
  teamRoles: unknown;
  pipelines: unknown;
  nexaConfig: unknown;
  customBranding: unknown;
};

type PreviewPayload = {
  workspaceConfig: WorkspaceConfig;
  business: {
    id: string;
    name: string;
    healthScore: number;
  };
  accessToken: string;
  expiresAt: string;
};

function asArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function TooltipButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      title="Activate trial to use this"
      className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-400"
      onClick={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

export function WorkspacePreviewClient({ token }: { token: string }) {
  const [data, setData] = useState<PreviewPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      const response = await fetch(`/api/onboarding/preview?token=${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as
        | PreviewPayload
        | { error?: string };
      setLoading(false);

      if (!response.ok) {
        setError("error" in payload ? payload.error ?? "Preview not found." : "Preview not found.");
        return;
      }

      setData(payload as PreviewPayload);
    }

    void loadPreview();
  }, [token]);

  const details = useMemo(() => {
    if (!data) return null;
    const config = data.workspaceConfig;
    const products = asArray<{ name?: string; pipelineStages?: string[] }>(config.products);
    const roles = asArray<{ displayName?: string; systemRole?: string; assignedProducts?: string[] }>(
      config.teamRoles,
    );
    const nexa = (config.nexaConfig ?? {}) as Record<string, unknown>;
    const welcome = text(
      nexa.customWelcomeMessage,
      `Welcome to ${config.companyName}. NEXA is ready to help your team prioritize leads, tasks, and follow-ups.`,
    );

    return { products, roles, nexa, welcome };
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070709] p-8 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-20 rounded-2xl bg-white/10" />
          <div className="grid gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl bg-white/10" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-white/10" />
        </div>
      </main>
    );
  }

  if (error || !data || !details) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070709] p-8 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="font-heading text-2xl font-bold">Preview unavailable</h1>
          <p className="mt-2 text-sm text-red-100/80">{error || "This preview link is invalid or expired."}</p>
        </div>
      </main>
    );
  }

  const activateHref = `/activate-trial?businessId=${data.business.id}&token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen bg-[#070709] pb-32 text-white">
      <div className="sticky top-0 z-30 border-b border-emerald-400/20 bg-[#08110d]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-emerald-50">
            <span className="font-semibold">Your BGOS workspace is ready</span> - built specifically for{" "}
            <span className="font-semibold text-[#2ECC8A]">{data.workspaceConfig.companyName}</span>. This is a
            preview. Activate your free trial to unlock your team.
          </p>
          <Link
            href={activateHref}
            className="rounded-xl bg-[#2ECC8A] px-5 py-3 text-sm font-bold text-[#07100b] shadow-[0_0_30px_rgba(46,204,138,0.25)]"
          >
            Start 7-day free trial →
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#111119] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Read-only boss dashboard preview</p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold">{data.workspaceConfig.companyName}</h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">{details.welcome}</p>
              </div>
              <TooltipButton>Invite team</TooltipButton>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Health score", data.business.healthScore],
              ["Total leads", 0],
              ["Won this month", 0],
              ["Team members", details.roles.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                <p className="mt-3 font-heading text-3xl font-bold">{value}</p>
                <p className="mt-2 text-xs text-zinc-500">Preview data</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Configured pipelines</h2>
              <TooltipButton>Add lead</TooltipButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {details.products.map((product, index) => (
                <div key={`${product.name}-${index}`} className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4">
                  <h3 className="font-heading text-base font-bold">{product.name ?? `Pipeline ${index + 1}`}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(product.pipelineStages ?? ["New", "Contacted", "Won"]).map((stage) => (
                      <span key={stage} className="rounded-full border border-[#2ECC8A]/25 bg-[#2ECC8A]/10 px-3 py-1 text-xs text-[#bff7dc]">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
            <h2 className="font-heading text-lg font-bold">Team structure</h2>
            <div className="mt-5 grid gap-3">
              {details.roles.map((role, index) => (
                <div key={`${role.displayName}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{role.displayName ?? `Role ${index + 1}`}</p>
                    <p className="mt-1 text-xs text-zinc-500">{role.systemRole ?? "BDM"} access</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                    {(role.assignedProducts ?? []).length || details.products.length} pipelines
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#2ECC8A]/25 bg-[#102017] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#2ECC8A]">NEXA preview</p>
            <p className="mt-4 text-sm leading-6 text-emerald-50">{details.welcome}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
            <h2 className="font-heading text-base font-bold">Preview mode</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Buttons, lead forms, team invites, and automations unlock once the trial is active.
            </p>
            <Link href={activateHref} className="mt-5 block rounded-xl bg-[#2ECC8A] px-4 py-3 text-center text-sm font-bold text-[#07100b]">
              Start Trial
            </Link>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl border border-[#2ECC8A]/25 bg-[#0f1914]/95 p-5 shadow-2xl backdrop-blur">
        <p className="text-sm text-emerald-50">
          You are previewing {data.workspaceConfig.companyName}&apos;s workspace. Looks good? Start your free trial - no
          charge for 7 days.
        </p>
        <Link href={activateHref} className="mt-4 block rounded-xl bg-[#2ECC8A] px-4 py-3 text-center text-sm font-bold text-[#07100b]">
          Start Trial
        </Link>
      </div>
    </main>
  );
}
