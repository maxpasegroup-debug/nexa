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
  emptyDescription = "This beta view is ready for guided testing while deeper workflow automation is connected.",
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
                <p className="mt-2 text-sm text-white/70">Beta preview</p>
              </div>
            ))}
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA suggestion</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Guardian Angel guidance</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">{nexaSuggestion}</p>
          <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-800">Beta mode</p>
            <p className="mt-1 text-sm leading-6 text-cyan-800/75">
              This page is available for beta navigation and will deepen as feedback is collected.
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
            description="A guided beta view showing the product direction for this workflow."
          />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Designed", "Beta-ready", "Route ready"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <BlizzwayBadge tone="slate">{item}</BlizzwayBadge>
                <p className="mt-3 text-sm leading-6 c7-muted">
                  Navigation works and this section is ready for beta feedback.
                </p>
              </div>
            ))}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
