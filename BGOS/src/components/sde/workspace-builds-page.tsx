"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { OnboardingRequestCard, type OnboardingRequestCardSession } from "@/components/sde/onboarding-request-card";

type User = {
  id: string;
  name: string;
  role: string;
  businessName: string;
};

export function WorkspaceBuildsPage({ user, builds }: { user: User; builds: OnboardingRequestCardSession[] }) {
  const visibleBuilds = builds.filter(
    (build) => build.sdeId === user.id || build.sdeId === null,
  );

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title="Workspace builds" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Workspace builds</h1>
            <p className="mt-1 text-sm text-zinc-500">Review intelligent onboarding summaries and approve workspaces.</p>
          </section>
          {visibleBuilds.length ? (
            <div className="grid gap-4">
              {visibleBuilds.map((build) => (
                <OnboardingRequestCard key={build.id} session={build} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#13131c] px-4 py-10 text-center text-zinc-500">
              No build sessions assigned yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
