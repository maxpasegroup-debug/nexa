import { Career7Badge, Career7Card, Career7Button, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const filters = ["All", "Resume", "Interview", "Language", "Migration", "Finance", "Exams"];
const market = [
  ["Resume Architect", "Resume", "180", "Featured"],
  ["Interview Studio", "Interview", "220", "Trending"],
  ["English Spark", "Language", "140", "Popular"],
  ["IELTS Oracle", "Exams", "260", "Focused"],
  ["Migration Mapper", "Migration", "300", "Premium"],
  ["Money Rhythm", "Finance", "120", "Starter"],
  ["Portfolio Forge", "Resume", "240", "Featured"],
  ["Opportunity Scout", "Earning", "200", "Trending"],
];

export default function MagicMarketPage() {
  return (
    <Career7DashboardShell
      activeHref="/magic-market"
      title="Magic Market"
      description="An app-store style Blizzway marketplace with dummy companions, boosts, and career tools."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Featured companions</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Choose the right magic for the next step.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Dummy marketplace shelves preview how users will browse career helpers before backend integration.
          </p>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Search Magic Market</span>
            <input
              placeholder="Search resume, interview, language..."
              className="mt-3 h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <button key={filter} className={`rounded-full border px-4 py-2 text-xs font-black ${index === 0 ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                {filter}
              </button>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {market.map(([name, category, credits, badge]) => (
          <Career7Card key={name} as="article" variant="companion" className="c7-lift-card">
            <div className="flex items-start justify-between gap-3">
              <span className="c7-icon-tile">{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
              <Career7Badge tone={badge === "Trending" ? "emerald" : "slate"}>{badge}</Career7Badge>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-2 text-sm c7-muted">{category} companion</p>
            <p className="mt-5 text-2xl font-black text-slate-950">{credits} credits</p>
            <Career7Button type="button" variant="dark" size="sm" className="mt-5 w-full">
              Preview
            </Career7Button>
          </Career7Card>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
