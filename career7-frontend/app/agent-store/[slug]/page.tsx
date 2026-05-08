import Link from "next/link";
import { notFound } from "next/navigation";

import { Career7Badge, Career7Button, Career7Card } from "@/components/career7";
import { Career7DashboardShell } from "../../dashboard-shell";

type AgentDetail = {
  slug: string;
  icon: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  accent: "indigo" | "cyan" | "emerald" | "violet" | "teal";
  benefits: string[];
  helpsWith: string[];
  outcomes: string[];
  recommendation: string;
  fitScore: number;
};

const companions: AgentDetail[] = [
  {
    slug: "resume-architect",
    icon: "CV",
    title: "Resume Architect",
    category: "Career",
    description: "Sharper resumes for proof-led applications.",
    longDescription:
      "Resume Architect turns rough experience into clear achievements, role-fit bullets, and recruiter-friendly positioning for your next application sprint.",
    price: 180,
    accent: "indigo",
    benefits: [
      "Transforms responsibilities into measurable proof points.",
      "Matches your resume language to target roles.",
      "Creates a cleaner summary, skills stack, and impact story.",
    ],
    helpsWith: ["Resume rewrite", "ATS clarity", "Role-fit bullets", "LinkedIn headline"],
    outcomes: ["Proof-first resume", "Application confidence", "Cleaner career narrative"],
    recommendation:
      "Guardian Angel AI recommends adding this before applying to premium roles because your proof stack becomes easier for recruiters to scan.",
    fitScore: 94,
  },
  {
    slug: "english-teacher",
    icon: "EN",
    title: "English Teacher",
    category: "Language",
    description: "Daily fluency practice for workplace confidence.",
    longDescription:
      "English Teacher gives you simple speaking drills, vocabulary upgrades, and practical feedback loops for interviews, meetings, and everyday career communication.",
    price: 120,
    accent: "cyan",
    benefits: [
      "Builds daily speaking rhythm without heavy lessons.",
      "Improves workplace vocabulary and sentence structure.",
      "Creates short practice prompts for interviews and meetings.",
    ],
    helpsWith: ["Speaking practice", "Workplace vocabulary", "Confidence drills", "Grammar polish"],
    outcomes: ["Clearer speaking", "Better interviews", "Stronger daily communication"],
    recommendation:
      "Guardian Angel AI recommends this if you want communication practice that feels practical, light, and easy to repeat every day.",
    fitScore: 91,
  },
  {
    slug: "ielts-coach",
    icon: "IE",
    title: "IELTS Coach",
    category: "Exam",
    description: "Band-focused IELTS prep with calm structure.",
    longDescription:
      "IELTS Coach builds a focused prep path across speaking, writing, listening, and reading with mock routines and improvement notes.",
    price: 220,
    accent: "violet",
    benefits: [
      "Creates a band-focused practice plan.",
      "Breaks writing and speaking into repeatable drills.",
      "Keeps weak areas visible between mock tests.",
    ],
    helpsWith: ["Speaking bands", "Writing tasks", "Mock tests", "Revision planning"],
    outcomes: ["Better prep rhythm", "Clear weak spots", "Higher test confidence"],
    recommendation:
      "Guardian Angel AI recommends this when exam readiness is blocking migration, study, or job plans.",
    fitScore: 89,
  },
  {
    slug: "freelance-finder",
    icon: "FF",
    title: "Freelance Finder",
    category: "Earning Universe",
    description: "Finds starter gigs and packages your skills.",
    longDescription:
      "Freelance Finder helps you turn your current skill stack into small offers, outreach messages, and realistic first projects.",
    price: 160,
    accent: "emerald",
    benefits: [
      "Finds offer angles from skills you already have.",
      "Drafts simple outreach for beginner-friendly projects.",
      "Keeps Earning Universe actions small enough to start today.",
    ],
    helpsWith: ["Gig ideas", "Offer packaging", "Client outreach", "Weekly Earning Universe plan"],
    outcomes: ["First offer clarity", "Faster outreach", "Earning Universe momentum"],
    recommendation:
      "Guardian Angel AI recommends this when you need a practical Earning Universe action instead of another planning session.",
    fitScore: 92,
  },
  {
    slug: "visa-expert",
    icon: "VE",
    title: "Visa Expert",
    category: "Migration",
    description: "Organizes visa paths, documents, and next steps.",
    longDescription:
      "Visa Expert helps you compare migration paths, understand document readiness, and keep application preparation organized.",
    price: 260,
    accent: "teal",
    benefits: [
      "Turns migration research into a clean action checklist.",
      "Highlights missing documents and timing risks.",
      "Keeps study, work, and travel paths easy to compare.",
    ],
    helpsWith: ["Visa checklist", "Country comparison", "Document planning", "Timeline clarity"],
    outcomes: ["Cleaner migration plan", "Fewer missed steps", "Better readiness tracking"],
    recommendation:
      "Guardian Angel AI recommends this if your next growth move depends on migration planning or document readiness.",
    fitScore: 88,
  },
];

const accentClass: Record<AgentDetail["accent"], string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/20",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
  violet: "from-violet-500 to-fuchsia-600 shadow-violet-500/20",
  teal: "from-teal-500 to-cyan-600 shadow-teal-500/20",
};

function AgentIcon({ companion, large = false }: { companion: AgentDetail; large?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br font-black text-white shadow-xl ${
        large ? "h-20 w-20 text-2xl sm:h-24 sm:w-24" : "h-12 w-12 text-sm"
      } ${accentClass[companion.accent]}`}
      aria-hidden="true"
    >
      {companion.icon}
    </span>
  );
}

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

export function generateStaticParams() {
  return companions.map((companion) => ({ slug: companion.slug }));
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companion = companions.find((item) => item.slug === slug);

  if (!companion) {
    notFound();
  }

  const relatedAgents = companions.filter((item) => item.slug !== companion.slug).slice(0, 3);

  return (
    <Career7DashboardShell
      activeHref="/agent-store"
      eyebrow="companion detail"
      title={companion.title}
      description={companion.description}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Magic Market", href: "/agent-store" },
        { label: companion.title },
      ]}
    >
      <section className="mt-5 overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
        <Link
          href="/agent-store"
          className="inline-flex min-h-9 items-center rounded-full bg-white/10 px-4 text-xs font-black text-white/78 ring-1 ring-white/10 transition hover:bg-white/16"
        >
          Back to Magic Market
        </Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.38fr] xl:items-end">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <AgentIcon companion={companion} large />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400/14 px-3 py-1 text-xs font-black text-cyan-100 ring-1 ring-cyan-200/20">
                  {companion.category}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/76 ring-1 ring-white/10">
                  Dummy companion
                </span>
              </div>
              <h2 className="mt-4 max-w-3xl text-[2rem] font-black leading-tight tracking-tight sm:text-5xl">
                {companion.title}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
                {companion.longDescription}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Credit cost
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-black">{companion.price}</span>
              <span className="pb-2 text-sm font-bold c7-muted">credits</span>
            </div>
            <p className="mt-3 text-sm leading-6 c7-muted">
              One-time dummy install cost for adding this companion to your Blizzway My Pathway.
            </p>
            <Career7Button type="button" variant="primary" className="mt-5 w-full">
              Add to My Pathway
            </Career7Button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        <div className="grid gap-5">
          <Career7Card as="section">
            <SectionTitle
              eyebrow="Benefits"
              title="Why add this companion"
              description="Clear, practical gains this dummy specialist brings into your Blizzway workflow."
            />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {companion.benefits.map((benefit, index) => (
                <div key={benefit} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-indigo-600 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-bold leading-6 text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </Career7Card>

          <Career7Card as="section">
            <SectionTitle
              eyebrow="Helps with"
              title="What this companion handles"
              description="Focused jobs this companion can support once added to your My Pathway."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {companion.helpsWith.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[18px] bg-slate-50 p-4">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500" />
                  <p className="font-black text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </Career7Card>
        </div>

        <div className="grid gap-5">
          <Career7Card as="section" className="bg-slate-950 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
              Guardian Angel AI recommendation
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black">{companion.fitScore}%</span>
              <span className="pb-2 text-sm font-bold text-white/58">fit</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/72">{companion.recommendation}</p>
          </Career7Card>

          <Career7Card as="section">
            <SectionTitle eyebrow="Expected outcomes" title="After install" />
            <div className="mt-5 grid gap-3">
              {companion.outcomes.map((outcome) => (
                <Career7Badge key={outcome} tone="slate" className="justify-center py-3">
                  {outcome}
                </Career7Badge>
              ))}
            </div>
          </Career7Card>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Related companions"
            title="Build the next layer"
            description="Other dummy specialists that pair well with this companion."
          />
          <Career7Badge tone="slate" className="self-start sm:self-auto">
            Dummy data only
          </Career7Badge>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {relatedAgents.map((relatedAgent) => (
            <Link
              key={relatedAgent.slug}
              href={`/agent-store/${relatedAgent.slug}`}
              className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm c7-lift-card"
            >
              <div className="flex items-start gap-3">
                <AgentIcon companion={relatedAgent} />
                <div className="min-w-0">
                  <h3 className="truncate font-black text-slate-950">{relatedAgent.title}</h3>
                  <p className="mt-1 text-xs font-bold c7-muted">{relatedAgent.category}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 c7-muted">{relatedAgent.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-black text-slate-950">
                  {relatedAgent.price} credits
                </span>
                <span className="text-xs font-black text-indigo-600">View</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Career7DashboardShell>
  );
}
