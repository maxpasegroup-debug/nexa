"use client";

import { useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BossWorkAlert } from "@/components/shared/boss-work-alert";
import { AgentIntegrationCard, type AgentIntegrationJob } from "@/components/sde/agent-integration-card";
import { OnboardingRequestCard, type OnboardingRequestCardSession } from "@/components/sde/onboarding-request-card";

type User = {
  id: string;
  name: string;
  role: string;
  businessName: string;
};

export function WorkspaceBuildsPage({
  user,
  builds,
  agentIntegrations = [],
}: {
  user: User;
  builds: OnboardingRequestCardSession[];
  agentIntegrations?: AgentIntegrationJob[];
}) {
  const [tab, setTab] = useState<"builds" | "agents">("builds");
  const [jobs, setJobs] = useState(agentIntegrations);
  const visibleBuilds = builds.filter(
    (build) => build.sdeId === user.id || build.sdeId === null,
  );

  return (
    <div className="min-h-screen bg-[#070709] md:pl-[240px] text-white">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title={tab === "builds" ? "Workspace builds" : "Agent integrations"} userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <BossWorkAlert />
          <section>
            <h1 className="font-heading text-2xl font-bold">Workspace builds</h1>
            <p className="mt-1 text-sm text-zinc-500">Review intelligent onboarding summaries and approve workspaces.</p>
            <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-[#13131c] p-1">
              <button
                type="button"
                onClick={() => setTab("builds")}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "builds" ? "bg-white text-black" : "text-zinc-400"}`}
              >
                Workspace builds
              </button>
              <button
                type="button"
                onClick={() => setTab("agents")}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "agents" ? "bg-white text-black" : "text-zinc-400"}`}
              >
                Agent integrations
              </button>
            </div>
          </section>

          {tab === "builds" && visibleBuilds.length ? (
            <div className="grid gap-4">
              {visibleBuilds.map((build) => (
                <OnboardingRequestCard key={build.id} session={build} />
              ))}
            </div>
          ) : null}
          {tab === "builds" && !visibleBuilds.length ? (
            <div className="rounded-2xl border border-white/10 bg-[#13131c] px-4 py-10 text-center text-zinc-500">
              No build sessions assigned yet.
            </div>
          ) : null}

          {tab === "agents" && jobs.length ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <AgentIntegrationCard
                  key={job.id}
                  job={job}
                  onComplete={(id) => setJobs((current) => current.filter((item) => item.id !== id))}
                />
              ))}
            </div>
          ) : null}
          {tab === "agents" && !jobs.length ? (
            <div className="rounded-2xl border border-white/10 bg-[#13131c] px-4 py-10 text-center text-zinc-500">
              No agent integration jobs assigned yet.
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
