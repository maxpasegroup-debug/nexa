import { Career7Badge, Career7Button, Career7Card, Career7GradientPanel } from "@/components/career7";
import { blizzwayCatalogue, allBlizzwayCatalogueItems, type BlizzwayCatalogueItem } from "@/lib/blizzway/catalogue";
import { Career7DashboardShell } from "../dashboard-shell";

const categoryHighlights = blizzwayCatalogue.map((group) => ({
  title: group.title,
  count: group.items.length,
  summary: group.summary,
}));

function initials(value: string) {
  return value
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CompanionCard({ item }: { item: BlizzwayCatalogueItem }) {
  return (
    <Career7Card as="article" variant="companion" className="flex h-full flex-col c7-lift-card">
      <div className="flex items-start justify-between gap-3">
        <span className="c7-icon-tile">{initials(item.name)}</span>
        <Career7Badge tone={item.recommended ? "emerald" : "slate"}>
          {item.recommended ? "Recommended" : item.level}
        </Career7Badge>
      </div>
      <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 c7-muted">{item.description}</p>
      <div className="mt-5 rounded-2xl bg-indigo-50 p-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Guardian-style role</p>
        <p className="mt-1 text-sm font-semibold text-indigo-700/80">
          Guides with warmth, clarity, and practical next actions.
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="font-black text-slate-950">{item.credits} credits</p>
        <Career7Button type="button" size="sm" variant={item.recommended ? "primary" : "secondary"}>
          {item.recommended ? "Start" : "Add"}
        </Career7Button>
      </div>
    </Career7Card>
  );
}

export default function CompanionsPage() {
  return (
    <Career7DashboardShell
      activeHref="/companions"
      title="Companions"
      description="The full dummy companion catalogue, grouped by Blizzway service families."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Companion catalogue</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Build your personal support constellation.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            {allBlizzwayCatalogueItems.length} dummy companions and tools are visible across every major Blizzway growth category.
          </p>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA suggestion</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Start with three companions.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            NEXA recommends one profile companion, one learning companion, and one happiness companion before expanding.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {["Profile", "Learning", "Happiness"].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-black text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categoryHighlights.map((category) => (
          <Career7Card key={category.title} as="section" className="c7-magical-glow">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{category.title}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{category.count}</p>
            <p className="mt-2 text-sm leading-6 c7-muted">{category.summary}</p>
          </Career7Card>
        ))}
      </section>

      <section className="mt-7 grid gap-7">
        {blizzwayCatalogue.map((group) => (
          <div key={group.title}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{group.tone}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{group.title}</h2>
              </div>
              <Career7Badge tone="slate">{group.items.length} companions</Career7Badge>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => <CompanionCard key={item.name} item={item} />)}
            </div>
          </div>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
