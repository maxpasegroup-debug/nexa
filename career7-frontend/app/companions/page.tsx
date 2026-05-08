import { Career7Badge, Career7Button, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const categories = ["Career", "Learning", "Earning", "Wellbeing", "Migration"];
const companions = [
  ["NEXA", "Guardian", "Your Guardian Angel AI for calm decisions and next best actions."],
  ["Resume Architect", "Career", "Transforms experience into recruiter-ready career stories."],
  ["Language Lumina", "Learning", "Builds confidence in speaking, writing, and interviews."],
  ["Opportunity Scout", "Earning", "Finds practical roles, gigs, and outreach ideas."],
  ["Soul Keeper", "Wellbeing", "Protects confidence memories, reflections, and dreams."],
  ["Migration Mapper", "Migration", "Organizes global pathway readiness and document focus."],
];

export default function CompanionsPage() {
  return (
    <Career7DashboardShell
      activeHref="/companions"
      title="Companions"
      description="Guardian-style AI companions for every stage of the Blizzway career journey."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Companion categories</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Build a support team that feels personal.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-full bg-white/14 px-4 py-2 text-sm font-black ring-1 ring-white/14">
                {category}
              </span>
            ))}
          </div>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA suggestion</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Start with one companion per goal.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Too many guides can create noise. NEXA recommends one clarity companion, one learning companion, and one launch companion.
          </p>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companions.map(([name, category, description]) => (
          <Career7Card key={name} as="article" variant="companion" className="c7-lift-card">
            <div className="flex items-start justify-between gap-3">
              <span className="c7-icon-tile">{name.slice(0, 2).toUpperCase()}</span>
              <Career7Badge tone={category === "Guardian" ? "purple" : "slate"}>{category}</Career7Badge>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
            <Career7Button type="button" variant="secondary" size="sm" className="mt-5 w-full">
              Add to pathway
            </Career7Button>
          </Career7Card>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
