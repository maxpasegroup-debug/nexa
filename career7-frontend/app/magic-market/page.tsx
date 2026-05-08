import { Career7Badge, Career7Button, Career7Card, Career7GradientPanel } from "@/components/career7";
import { blizzwayCatalogue, allBlizzwayCatalogueItems, type BlizzwayCatalogueItem } from "@/lib/blizzway/catalogue";
import { Career7DashboardShell } from "../dashboard-shell";

const filters = ["All", ...blizzwayCatalogue.map((group) => group.title)];
const featured = allBlizzwayCatalogueItems.filter((item) => item.recommended).slice(0, 6);

function initials(value: string) {
  return value
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CatalogueCard({ item }: { item: BlizzwayCatalogueItem }) {
  return (
    <Career7Card as="article" variant="companion" className="flex h-full flex-col c7-lift-card">
      <div className="flex items-start justify-between gap-3">
        <span className="c7-icon-tile">{initials(item.name)}</span>
        {item.recommended ? (
          <Career7Badge tone="emerald" className="shrink-0">Recommended</Career7Badge>
        ) : (
          <Career7Badge tone="slate" className="shrink-0">{item.level}</Career7Badge>
        )}
      </div>
      <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{item.name}</h3>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{item.category}</p>
      <p className="mt-3 flex-1 text-sm leading-6 c7-muted">{item.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Credits</p>
          <p className="text-2xl font-black text-slate-950">{item.credits}</p>
        </div>
        <Career7Button type="button" variant={item.recommended ? "primary" : "dark"} size="sm">
          {item.recommended ? "Start" : "Add"}
        </Career7Button>
      </div>
    </Career7Card>
  );
}

export default function MagicMarketPage() {
  return (
    <Career7DashboardShell
      activeHref="/magic-market"
      title="Magic Market"
      description="The complete Blizzway catalogue of services, companions, and premium dummy career tools."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Complete catalogue</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Every magical career service, visible before backend integration.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Browse {allBlizzwayCatalogueItems.length} dummy tools across profile, language, exams, career growth, migration, earning, happiness, and premium pathways.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["8 categories", `${allBlizzwayCatalogueItems.length} tools`, `${featured.length} recommended`].map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm text-white/70">Dummy catalogue</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Search catalogue</span>
            <input
              placeholder="Search resume, IELTS, visa, confidence..."
              className="mt-3 h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <div className="mt-5 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-black ${
                  index === 0
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Featured companions</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Recommended by NEXA</h2>
          </div>
          <Career7Badge tone="purple">Guardian picks</Career7Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((item) => <CatalogueCard key={item.name} item={item} />)}
        </div>
      </section>

      <section className="mt-7 grid gap-7">
        {blizzwayCatalogue.map((group) => (
          <div key={group.title}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{group.tone}</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{group.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 c7-muted">{group.summary}</p>
              </div>
              <Career7Badge tone="slate">{group.items.length} services</Career7Badge>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {group.items.map((item) => <CatalogueCard key={item.name} item={item} />)}
            </div>
          </div>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
