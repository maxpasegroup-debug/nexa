import {
  Career7Badge,
  Career7Card,
  Career7EmptyState,
  Career7GradientPanel,
  Career7SectionTitle,
} from "@/components/career7";

import { Career7DashboardShell } from "./dashboard-shell";

type PlaceholderPageProps = {
  activeHref: string;
  eyebrow: string;
  title: string;
  description: string;
  previewTitle: string;
  previewDescription: string;
  highlights: string[];
};

export function PlaceholderPage({
  activeHref,
  eyebrow,
  title,
  description,
  previewTitle,
  previewDescription,
  highlights,
}: PlaceholderPageProps) {
  return (
    <Career7DashboardShell
      activeHref={activeHref}
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.86fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">{previewTitle}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">{previewDescription}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">Phase 1 preview</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>

        <Career7EmptyState
          title={`${title} is coming next`}
          description="This placeholder keeps navigation complete while the real Career7 business logic, data, and workflows are designed."
          actionLabel="Back to dashboard"
          actionHref="/dashboard"
        />
      </section>

      <section className="mt-5">
        <Career7Card>
          <Career7SectionTitle
            eyebrow="Phase 1 surface"
            title="What this page will become"
            description="A clean placeholder card showing the intended product direction without connecting backend APIs."
          />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Designed", "Dummy data", "Route ready"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Career7Badge tone="slate">{item}</Career7Badge>
                <p className="mt-3 text-sm leading-6 c7-muted">
                  Navigation works and this page is ready for future implementation.
                </p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
