import {
  BlizzwayBadge,
  BlizzwayCard,
  BlizzwayEmptyState,
  BlizzwayGradientPanel,
  BlizzwaySectionTitle,
} from "@/components/blizzway";

import { BlizzwayDashboardShell } from "./dashboard-shell";

type PlaceholderPageProps = {
  activeHref: string;
  eyebrow: string;
  title: string;
  description: string;
  previewTitle: string;
  previewDescription: string;
  highlights: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  nexaSuggestion?: string;
};

export function PlaceholderPage({
  activeHref,
  eyebrow,
  title,
  description,
  previewTitle,
  previewDescription,
  highlights,
  emptyTitle = `${title} is ready for its next layer`,
  emptyDescription = "This placeholder uses dummy data only while the real Blizzway workflows are designed.",
  nexaSuggestion = "NEXA suggests choosing one calm action today, then saving the result in Soul Vault.",
}: PlaceholderPageProps) {
  return (
    <BlizzwayDashboardShell
      activeHref={activeHref}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">{previewTitle}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">{previewDescription}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">Dummy preview</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA suggestion</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Guardian Angel guidance</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">{nexaSuggestion}</p>
          <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-800">Preview only</p>
            <p className="mt-1 text-sm leading-6 text-cyan-800/75">
              No backend API, auth, or saved state is connected on this page.
            </p>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.7fr_1fr]">
        <BlizzwayEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Back to dashboard"
          actionHref="/dashboard"
        />

        <BlizzwayCard as="section">
          <BlizzwaySectionTitle
            eyebrow="Route preview"
            title="What this page will become"
            description="A beautiful placeholder card showing the intended product direction without connecting backend APIs."
          />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Designed", "Dummy data", "Route ready"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <BlizzwayBadge tone="slate">{item}</BlizzwayBadge>
                <p className="mt-3 text-sm leading-6 c7-muted">
                  Navigation works and this page is ready for future implementation.
                </p>
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
