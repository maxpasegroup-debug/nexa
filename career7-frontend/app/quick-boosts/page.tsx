import { Career7Badge, Career7Button, Career7Card } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

type BoostCategory = "Resume" | "Interview" | "Learning Garden" | "Language" | "Migration" | "Finance";

type QuickBoost = {
  title: string;
  category: BoostCategory;
  time: string;
  credits: number;
  description: string;
  icon: string;
  accent: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet";
  featured?: boolean;
  recommended?: boolean;
};

const quickBoosts: QuickBoost[] = [
  {
    title: "Resume ATS Scan",
    category: "Resume",
    time: "4 min",
    credits: 45,
    description: "Checks structure, keywords, clarity, and recruiter scan strength.",
    icon: "ATS",
    accent: "indigo",
    featured: true,
    recommended: true,
  },
  {
    title: "Grammar Fixer",
    category: "Language",
    time: "2 min",
    credits: 20,
    description: "Polishes grammar, tone, and confidence for career documents.",
    icon: "GF",
    accent: "cyan",
    featured: true,
  },
  {
    title: "Salary Estimator",
    category: "Finance",
    time: "3 min",
    credits: 35,
    description: "Estimates salary range and negotiation anchors from dummy role signals.",
    icon: "$",
    accent: "emerald",
    featured: true,
    recommended: true,
  },
  {
    title: "SOP Generator",
    category: "Migration",
    time: "8 min",
    credits: 75,
    description: "Creates a study or migration statement draft with a clean story arc.",
    icon: "SOP",
    accent: "violet",
    recommended: true,
  },
  {
    title: "Interview Questions",
    category: "Interview",
    time: "5 min",
    credits: 50,
    description: "Generates role-specific questions and sharp answer practice prompts.",
    icon: "IQ",
    accent: "rose",
    featured: true,
  },
  {
    title: "Skill Gap Scanner",
    category: "Learning Garden",
    time: "6 min",
    credits: 55,
    description: "Finds missing skills between your current profile and target role.",
    icon: "SG",
    accent: "amber",
    recommended: true,
  },
  {
    title: "LinkedIn Headline",
    category: "Resume",
    time: "3 min",
    credits: 30,
    description: "Creates a sharper headline and about-section starter.",
    icon: "IN",
    accent: "cyan",
  },
  {
    title: "Mock Answer Drill",
    category: "Interview",
    time: "7 min",
    credits: 60,
    description: "Turns one interview question into a stronger, structured answer.",
    icon: "MA",
    accent: "indigo",
    recommended: true,
  },
  {
    title: "Vocabulary Pack",
    category: "Language",
    time: "4 min",
    credits: 25,
    description: "Builds a small workplace vocabulary set for your target career lane.",
    icon: "VP",
    accent: "emerald",
  },
  {
    title: "Course Picker",
    category: "Learning Garden",
    time: "5 min",
    credits: 40,
    description: "Recommends a dummy Learning Garden path from your next role goal.",
    icon: "CP",
    accent: "violet",
  },
  {
    title: "Visa Checklist",
    category: "Migration",
    time: "6 min",
    credits: 65,
    description: "Organizes documents, blockers, and next steps for a migration plan.",
    icon: "VC",
    accent: "cyan",
  },
  {
    title: "Budget Snapshot",
    category: "Finance",
    time: "3 min",
    credits: 30,
    description: "Creates a quick savings, spend, and weekly Earning Universe snapshot.",
    icon: "BS",
    accent: "amber",
  },
];

const categoryTone: Record<BoostCategory, string> = {
  Resume: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Interview: "bg-rose-50 text-rose-700 border-rose-100",
  "Learning Garden": "bg-amber-50 text-amber-700 border-amber-100",
  Language: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Migration: "bg-violet-50 text-violet-700 border-violet-100",
  Finance: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const accentClass: Record<QuickBoost["accent"], string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/18",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/18",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/18",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/18",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/18",
  violet: "from-violet-500 to-fuchsia-600 shadow-violet-500/18",
};

const categories: BoostCategory[] = ["Resume", "Interview", "Learning Garden", "Language", "Migration", "Finance"];
const featuredBoosts = quickBoosts.filter((boost) => boost.featured);
const recommendedBoosts = quickBoosts.filter((boost) => boost.recommended);

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

function BoostIcon({ boost, large = false }: { boost: QuickBoost; large?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br font-black text-white shadow-lg ${
        large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
      } ${accentClass[boost.accent]}`}
      aria-hidden="true"
    >
      {boost.icon}
    </span>
  );
}

function BoostCard({ boost }: { boost: QuickBoost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm c7-lift-card">
      <div className="bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <BoostIcon boost={boost} />
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${categoryTone[boost.category]}`}>
            {boost.category}
          </span>
        </div>
        <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950">{boost.title}</h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm leading-6 c7-muted">{boost.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Time</p>
            <p className="mt-1 font-black text-slate-950">{boost.time}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Cost</p>
            <p className="mt-1 font-black text-slate-950">{boost.credits} credits</p>
          </div>
        </div>
        <Career7Button type="button" variant="dark" size="sm" className="mt-5 w-full">
          Run Boost
        </Career7Button>
      </div>
    </article>
  );
}

function FeaturedBoost({ boost }: { boost: QuickBoost }) {
  return (
    <article className="flex min-h-full flex-col rounded-[22px] border border-white/16 bg-white/12 p-4 text-white ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <BoostIcon boost={boost} large />
        <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white/82">
          {boost.time}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight">{boost.title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/72">{boost.description}</p>
      <div className="mt-5 flex flex-1 items-end justify-between gap-3">
        <span className="text-sm font-black text-white">{boost.credits} credits</span>
        <button
          type="button"
          className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-50"
        >
          Start
        </button>
      </div>
    </article>
  );
}

export default function QuickBoostsPage() {
  return (
    <Career7DashboardShell
      activeHref="/quick-boosts"
      eyebrow="Quick Boosts"
      title="Quick Boosts"
      description="Fast, credit-powered tools for small but meaningful career wins."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Quick Boosts" }]}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.38fr]">
        <div className="overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Featured quick wins
              </p>
              <h2 className="mt-3 max-w-2xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Pick one small boost. Feel the career shelf light up.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/70">
                Bite-sized tools for resume polish, interview prep, language confidence,
                migration planning, Learning Garden focus, and money clarity.
              </p>
            </div>
            <div className="rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10 lg:min-w-52">
              <p className="text-sm font-bold text-white/62">Best next boost</p>
              <p className="mt-2 text-2xl font-black">Resume ATS Scan</p>
              <p className="mt-1 text-sm text-white/58">4 min - 45 credits</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {featuredBoosts.map((boost) => (
              <FeaturedBoost key={boost.title} boost={boost} />
            ))}
          </div>
        </div>

        <Career7Card as="section" className="bg-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Guardian Angel AI recommendation
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Start with ATS, then run Interview Questions.
          </h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            Dummy signals suggest your fastest lift is cleaning resume scan strength before
            practicing role-specific answers.
          </p>
          <div className="mt-5 rounded-[22px] bg-slate-950 p-5 text-white">
            <p className="text-sm font-bold text-white/60">Recommended bundle</p>
            <p className="mt-2 text-4xl font-black">95</p>
            <p className="mt-1 text-sm text-white/58">credits - about 9 minutes</p>
          </div>
          <Career7Button type="button" variant="primary" className="mt-5 w-full">
            Run Recommended
          </Career7Button>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.42fr_1fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Recommended tools"
            title="Best matches now"
            description="High-impact dummy tools Guardian Angel AI would place near the top of your queue."
          />
          <div className="mt-5 grid gap-3">
            {recommendedBoosts.map((boost, index) => (
              <div key={boost.title} className="flex items-center gap-3 rounded-[20px] bg-slate-50 p-3">
                <span className="w-6 text-center text-sm font-black text-slate-400">
                  {index + 1}
                </span>
                <BoostIcon boost={boost} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">{boost.title}</p>
                  <p className="text-xs font-semibold c7-muted">
                    {boost.time} - {boost.credits} credits
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Career7Card>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Boost shelf"
              title="Quick career tools"
              description="A visual shelf of dummy boosts you can run without connecting any backend APIs."
            />
            <Career7Badge tone="slate" className="self-start sm:self-auto">
              Dummy data only
            </Career7Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickBoosts.map((boost) => (
              <BoostCard key={boost.title} boost={boost} />
            ))}
          </div>
        </section>
      </section>

      <section className="mt-5">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Categories"
            title="Six quick-win lanes"
            description="Each lane keeps the page scannable while still feeling like a premium app shelf."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categories.map((category) => {
              const count = quickBoosts.filter((boost) => boost.category === category).length;

              return (
                <div key={category} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${categoryTone[category]}`}>
                    {category}
                  </span>
                  <p className="mt-4 text-2xl font-black text-slate-950">{count}</p>
                  <p className="mt-1 text-sm font-semibold c7-muted">boosts ready</p>
                </div>
              );
            })}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
