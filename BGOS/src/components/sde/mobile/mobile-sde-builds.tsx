"use client";

import Link from "next/link";

type MobileSDEBuild = {
  id: string;
  sdeId?: string | null;
  companyName: string;
  bdmName: string | null;
  plan: string | null;
  submittedAt: string;
  completenessScore: number;
};

type MobileSDEBuildsProps = {
  builds: MobileSDEBuild[];
  currentUserId: string;
};

function timeSince(value: string) {
  const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3600000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
      <circle
        cx="23"
        cy="23"
        r={radius}
        fill="none"
        stroke={score >= 75 ? "#22D9A0" : score >= 45 ? "#F5A623" : "#FF6B6B"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference}
        transform="rotate(-90 23 23)"
      />
      <text x="23" y="26" textAnchor="middle" className="fill-white font-heading text-[10px] font-bold">{score}</text>
    </svg>
  );
}

export function MobileSDEBuilds({ builds, currentUserId }: MobileSDEBuildsProps) {
  const visibleBuilds = builds.filter(
    (build) => build.sdeId === currentUserId || build.sdeId === null,
  );

  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header>
        <h1 className="font-heading text-lg font-extrabold">Builds</h1>
        <p className="mt-1 text-[11px] text-[var(--muted)]">Pending workspace builds</p>
      </header>

      <section className="mt-4 space-y-3">
        {visibleBuilds.map((build) => {
          const overdue = Date.now() - new Date(build.submittedAt).getTime() > 24 * 3600000;
          return (
            <article
              key={build.id}
              className={`rounded-[16px] border bg-[var(--card)] p-4 ${overdue ? "border-[#FF6B6B]/45" : "border-white/10"}`}
            >
              <div className="flex items-start gap-3">
                <ScoreRing score={build.completenessScore} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-heading text-[13px] font-bold">{build.companyName}</h2>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">BDM: {build.bdmName ?? "Unassigned"}</p>
                  <p className="mt-1 text-[11px] text-zinc-600">{build.plan ?? "Plan pending"} · {timeSince(build.submittedAt)}</p>
                </div>
              </div>
              <Link href={`/sde/workspaces/${build.id}`} className="mt-4 block h-10 rounded-xl bg-[#7C6FFF] text-center font-heading text-xs font-bold leading-10 text-white">
                Open builder →
              </Link>
            </article>
          );
        })}
        {visibleBuilds.length === 0 ? (
          <div className="rounded-[16px] border border-white/10 bg-[var(--card)] p-5 text-center text-xs text-zinc-500">
            No pending workspace builds.
          </div>
        ) : null}
      </section>
    </main>
  );
}
