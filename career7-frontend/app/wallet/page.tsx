import { Career7Badge, Career7Button, Career7Card, Career7EmptyState } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

type TopUpPackage = {
  name: string;
  credits: number;
  price: string;
  bonus: string;
  tone: "indigo" | "cyan" | "emerald" | "amber";
  featured?: boolean;
};

type Transaction = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending";
  type: "credit" | "debit";
};

type AgentPrice = {
  name: string;
  category: string;
  credits: number;
  demand: string;
};

const packages: TopUpPackage[] = [
  { name: "Starter", credits: 500, price: "$9", bonus: "Best for quick boosts", tone: "cyan" },
  { name: "Growth", credits: 1200, price: "$19", bonus: "+100 bonus credits", tone: "indigo", featured: true },
  { name: "Pro", credits: 2800, price: "$39", bonus: "+400 bonus credits", tone: "emerald" },
  { name: "Elite", credits: 6400, price: "$79", bonus: "Blizzway-ready pack", tone: "amber" },
];

const transactions: Transaction[] = [
  {
    id: "txn-1001",
    title: "Resume Architect",
    category: "Agent install",
    amount: -180,
    date: "Today, 10:18 AM",
    status: "Completed",
    type: "debit",
  },
  {
    id: "txn-1002",
    title: "Growth credit pack",
    category: "Top-up package",
    amount: 1300,
    date: "Yesterday, 6:42 PM",
    status: "Completed",
    type: "credit",
  },
  {
    id: "txn-1003",
    title: "Resume ATS Scan",
    category: "Quick Boost",
    amount: -45,
    date: "May 6, 2026",
    status: "Completed",
    type: "debit",
  },
  {
    id: "txn-1004",
    title: "Blizzway preview",
    category: "Premium pathway",
    amount: -120,
    date: "May 5, 2026",
    status: "Pending",
    type: "debit",
  },
];

const featuredPricing: AgentPrice[] = [
  { name: "Resume Architect", category: "Career", credits: 180, demand: "High" },
  { name: "English Teacher", category: "Language", credits: 120, demand: "Popular" },
  { name: "IELTS Coach", category: "Exam", credits: 220, demand: "Focused" },
  { name: "Freelance Finder", category: "Earning", credits: 160, demand: "Fast" },
];

const analytics = [
  { label: "Agents", value: 42, color: "bg-indigo-600" },
  { label: "Boosts", value: 28, color: "bg-cyan-500" },
  { label: "Blizzway", value: 18, color: "bg-emerald-500" },
  { label: "Reviews", value: 12, color: "bg-amber-400" },
];

const toneClass: Record<TopUpPackage["tone"], string> = {
  indigo: "from-indigo-600 to-sky-500 shadow-indigo-500/18",
  cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/18",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/18",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/18",
};

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

function TopUpCard({ pack }: { pack: TopUpPackage }) {
  return (
    <article
      className={`relative overflow-hidden rounded-[24px] border bg-white p-5 shadow-sm ${
        pack.featured ? "border-indigo-200 shadow-xl shadow-indigo-500/10" : "border-slate-200"
      }`}
    >
      {pack.featured ? (
        <Career7Badge tone="indigo" className="absolute right-4 top-4">
          Best value
        </Career7Badge>
      ) : null}
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br text-sm font-black text-white shadow-lg ${toneClass[pack.tone]}`}
      >
        C7
      </span>
      <h3 className="mt-5 text-xl font-black text-slate-950">{pack.name}</h3>
      <p className="mt-1 text-sm font-semibold c7-muted">{pack.bonus}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black text-slate-950">{pack.credits.toLocaleString()}</p>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">credits</p>
        </div>
        <p className="text-2xl font-black text-slate-950">{pack.price}</p>
      </div>
      <Career7Button type="button" variant={pack.featured ? "primary" : "dark"} size="sm" className="mt-5 w-full">
        Top Up
      </Career7Button>
    </article>
  );
}

export default function WalletPage() {
  const hasTransactions = transactions.length > 0;

  return (
    <Career7DashboardShell
      activeHref="/wallet"
      eyebrow="Wallet"
      title="Wallet & Credits"
      description="Track Career7 credits for boosts, agents, reviews, and premium pathways."
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wallet" }]}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        <div className="overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                Current balance
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-6xl font-black tracking-tight sm:text-7xl">2,400</span>
                <span className="pb-3 text-lg font-bold text-white/64">credits</span>
              </div>
              <p className="mt-4 max-w-2xl leading-7 text-white/70">
                Dummy wallet balance for installing agents, running quick boosts, and previewing
                premium Blizzway pathways.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              {[
                ["Spent", "345"],
                ["Added", "1,300"],
                ["Pending", "120"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-sm font-bold text-white/58">{label}</p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Career7Card as="section">
          <SectionTitle
            eyebrow="Spending analytics"
            title="Preview"
            description="Dummy breakdown of how credits move across Career7."
          />
          <div className="mt-5 space-y-4">
            {analytics.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-black text-slate-700">{item.label}</p>
                  <p className="font-black text-slate-950">{item.value}%</p>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-200">
                  <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Top-up packages"
            title="Choose a credit pack"
            description="Payment gateways are not connected yet; these are clean dummy package cards."
          />
          <Career7Badge tone="slate" className="self-start sm:self-auto">
            Dummy data only
          </Career7Badge>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pack) => (
            <TopUpCard key={pack.name} pack={pack} />
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.42fr_1fr]">
        <Career7Card as="section">
          <SectionTitle
            eyebrow="Featured pricing"
            title="Agent costs"
            description="Popular dummy agent prices for planning credit spend."
          />
          <div className="mt-5 grid gap-3">
            {featuredPricing.map((agent) => (
              <div key={agent.name} className="rounded-[20px] bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{agent.name}</p>
                    <p className="mt-1 text-xs font-bold c7-muted">{agent.category}</p>
                  </div>
                  <Career7Badge tone="slate">{agent.demand}</Career7Badge>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-950">{agent.credits} credits</p>
              </div>
            ))}
          </div>
        </Career7Card>

        <Career7Card as="section">
          <SectionTitle
            eyebrow="Credit usage"
            title="Recent wallet history"
            description="A trustworthy transaction list UI using dummy activity only."
          />
          {hasTransactions ? (
            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid gap-3 border-b border-slate-200 bg-white p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{transaction.title}</p>
                    <p className="mt-1 text-sm font-semibold c7-muted">
                      {transaction.category} - {transaction.date}
                    </p>
                  </div>
                  <Career7Badge tone={transaction.status === "Completed" ? "emerald" : "slate"}>
                    {transaction.status}
                  </Career7Badge>
                  <p
                    className={`text-right text-lg font-black ${
                      transaction.type === "credit" ? "text-emerald-600" : "text-slate-950"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : ""}
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Career7EmptyState
              title="No credit activity yet"
              description="Your future top-ups, boosts, agent installs, and premium pathway spends will appear here."
              actionLabel="Browse Agent Store"
              actionHref="/agent-store"
              secondaryLabel="Run a Quick Boost"
              secondaryHref="/quick-boosts"
            />
          )}
        </Career7Card>
      </section>

      <section className="mt-5">
        <Career7Card as="section">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Empty state support
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Wallet states are ready for no-activity users.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 c7-muted">
                The page includes an empty history path so the UI still feels complete before a
                user buys credits or spends anything.
              </p>
            </div>
            <Career7Button type="button" variant="secondary" className="w-full lg:w-auto">
              View Credit Policy
            </Career7Button>
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
