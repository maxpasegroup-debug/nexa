import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import { InternalLeadsHybrid } from "@/components/internal/internal-leads-hybrid";
import { OnboardingPipeline } from "@/components/internal/onboarding-pipeline";
import { BossLocksPanel } from "@/components/internal/boss-locks-panel";
import { TechnicalOpsPanel } from "@/components/internal/technical-ops-panel";
import { requireInternalOwner } from "@/lib/internal-owner";

export default async function InternalLeadsPage() {
  const { owner } = await requireInternalOwner();

  return (
    <div className="min-h-screen bg-[#070709] md:pl-[240px] text-white">
      <InternalSidebar user={owner} />
      <InternalTopbar user={owner} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">BGOS Leads</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Hybrid Boss control for leads, BDM updates, and onboarding handoff.
            </p>
          </div>
          <BossLocksPanel />
          <InternalLeadsHybrid />
          <OnboardingPipeline />
          <TechnicalOpsPanel />
        </div>
      </main>
    </div>
  );
}
