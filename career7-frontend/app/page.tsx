import Link from "next/link";

const navItems = [
  { label: "Guardian Angel AI", href: "#guardian-angel-ai" },
  { label: "My Pathway", href: "#growth-board" },
  { label: "Magic Market", href: "#companion-store" },
  { label: "Credits", href: "#credits" },
];

const heroSignals = [
  ["Career clarity", "92%"],
  ["Growth tasks", "18"],
  ["Credit balance", "2,400"],
];

const growthSteps = [
  ["Discover", "Understand your role fit, skill gaps, and ambition map."],
  ["Build", "Turn goals into daily Learning Garden, proof, projects, and practice."],
  ["Earn", "Unlock boosts, gigs, mentors, and marketplace opportunities."],
];

const companions = [
  {
    name: "Resume Architect",
    tag: "Profile",
    desc: "Shapes your experience into role-ready career stories.",
    accent: "from-indigo-500 to-purple-500",
  },
  {
    name: "Interview Studio",
    tag: "Practice",
    desc: "Runs focused mock interviews and feedback loops.",
    accent: "from-cyan-500 to-indigo-500",
  },
  {
    name: "Opportunity Scout",
    tag: "Launch",
    desc: "Finds pathways, roles, and next best applications.",
    accent: "from-purple-500 to-fuchsia-500",
  },
];

const tools = ["Resume scan", "Mock interview", "Skill map", "Role fit", "Portfolio brief"];

const footerLinks = [
  { label: "Privacy", href: "/" },
  { label: "Terms", href: "/" },
  { label: "Support", href: "/" },
  { label: "Careers", href: "/" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Blizzway home">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-indigo-500/15">
        BW
      </span>
      <span>
        <span className="block text-base font-black tracking-tight text-slate-950">Blizzway</span>
        <span className="block text-xs font-semibold c7-muted">The Magical Career Pathway</span>
      </span>
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 c7-muted">{desc}</p>
    </div>
  );
}

function AgentIcon({ name }: { name: string }) {
  return (
    <span className="c7-icon-tile bg-white/20" aria-hidden="true">
      {name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

export default function Home() {
  return (
    <main className="c7-shell overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link href="/signup" className="c7-button-primary">
            Join waitlist
          </Link>
        </div>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.18),transparent_54%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div>
            <span className="c7-badge">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Premium AI career ecosystem - Powered by NEXA
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Your <span className="c7-gradient-text">The Magical Career Pathway</span> for Learning Garden,
              Earning Universe, and growth.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 c7-muted">
              Blizzway brings Guardian Angel AI, My Pathways, career companions, quick boosts,
              premium pathways, and credits into one friendly workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="c7-button-primary">
                Start exploring
              </Link>
              <a href="#growth-board" className="c7-button-secondary">
                See how it works
              </a>
            </div>
          </div>

          <div className="c7-card p-4 sm:p-5">
            <div className="c7-gradient-panel rounded-[24px] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Guardian Angel AI career command
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Today&apos;s plan</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {heroSignals.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                    <p className="text-sm text-white/70">{label}</p>
                    <p className="mt-2 text-3xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Resume", "Interview", "Portfolio"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="h-2 w-16 rounded-full bg-indigo-200" />
                  <p className="mt-4 text-sm font-black text-slate-950">{item}</p>
                  <p className="mt-1 text-xs c7-muted">Ready for boost</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="guardian-angel-ai" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="c7-sidebar rounded-[28px] p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Meet Guardian Angel AI</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Your career co-pilot.</h2>
            <p className="mt-4 leading-7 text-white/68">
              Guardian Angel AI understands your goals, reads your progress, recommends the next
              move, and keeps your career growth from becoming scattered.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Plan weekly moves", "Find skill gaps", "Recommend companions"].map((item) => (
              <article key={item} className="c7-card p-5">
                <div className="c7-icon-tile">{item.slice(0, 2).toUpperCase()}</div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{item}</h3>
                <p className="mt-2 text-sm leading-6 c7-muted">
                  Smart, focused guidance without overwhelming dashboards.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="growth-board" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="My Pathway"
            title="A visual board for your career momentum."
            desc="Your My Pathway turns ambition into visible actions: learn, build, earn, and launch."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {growthSteps.map(([title, desc], index) => (
              <article key={title} className="c7-card p-6">
                <span className="text-5xl font-black text-indigo-100">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 c7-muted">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="companion-store" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Magic Market</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                App-store style career companions.
              </h2>
            </div>
            <Link href="/agent-store" className="c7-button-secondary">Preview store</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {companions.map((companion) => (
              <article key={companion.name} className="c7-companion-card overflow-hidden p-4">
                <div className={`rounded-[20px] bg-gradient-to-br ${companion.accent} p-5 text-white shadow-lg shadow-indigo-500/20`}>
                  <div className="flex items-center justify-between">
                    <AgentIcon name={companion.name} />
                    <span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-bold">{companion.tag}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-black">{companion.name}</h3>
                </div>
                <p className="px-1 pt-4 text-sm leading-6 c7-muted">{companion.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="c7-section mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-2 lg:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
              Learning Garden + Earning Universe
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Learn the skill. Build the proof. Earn from momentum.
            </h2>
            <p className="mt-4 leading-7 c7-muted">
              Blizzway is designed as an ecosystem, not a course library. Learning Garden,
              practice, proof-of-work, mentors, companions, and Earning Universe paths live together.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Skill tracks", "Proof projects", "Mentor reviews", "Opportunity paths"].map((item) => (
              <div key={item} className="c7-card-compact p-4">
                <p className="font-black text-slate-950">{item}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">Connected to your My Pathway.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Quick Boosts"
            title="Small tools for fast career wins."
            desc="Use focused boosts when you need a sharp resume pass, interview drill, role fit check, or portfolio brief."
          />
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {tools.map((tool) => (
              <Link key={tool} href="/quick-boosts" className="c7-card-compact min-w-[190px] p-5">
                <span className="c7-icon-tile">{tool.slice(0, 2).toUpperCase()}</span>
                <p className="mt-5 font-black text-slate-950">{tool}</p>
                <p className="mt-2 text-sm c7-muted">Teaser tool</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="c7-gradient-panel mx-auto grid max-w-7xl gap-6 rounded-[30px] p-6 shadow-2xl shadow-indigo-500/20 lg:grid-cols-[0.9fr_1.1fr] lg:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Blizzway</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Premium pathway for accelerated careers.
            </h2>
            <p className="mt-4 leading-7 text-white/72">
              Blizzway is the high-touch pathway teaser for ambitious users who want a
              more guided, premium route through Learning Garden, proof, review, and launch.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Guided path", "Elite review", "Launch plan"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">Premium teaser</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="credits" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">Credits + Wallet</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              One wallet for boosts, companions, and premium guidance.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 c7-muted">
              Credits make Blizzway flexible. Spend them on Quick Boosts, companion actions,
              Blizzway upgrades, reviews, and future Earning Universe ecosystem features.
            </p>
          </div>
          <div className="c7-card p-5">
            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-sm text-white/60">Available credits</p>
              <p className="mt-2 text-5xl font-black">2,400</p>
              <div className="mt-6 space-y-3">
                {["Resume boost - 120", "Interview drill - 180", "companion action - 60"].map((item) => (
                  <div key={item} className="flex justify-between rounded-2xl bg-white/8 p-3 text-sm">
                    <span>{item.split(" - ")[0]}</span>
                    <span className="font-bold">{item.split(" - ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="c7-section mx-auto max-w-5xl p-6 text-center sm:p-10">
          <span className="c7-badge">Blizzway Phase 1</span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Build your next career move with an AI OS.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 c7-muted">
            Start with clarity, keep momentum on the My Pathway, and use companions
            whenever your next step needs more intelligence.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="c7-button-primary">Join the waitlist</Link>
            <Link href="/dashboard" className="c7-button-secondary">Explore preview</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-sm font-bold text-slate-500 hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
