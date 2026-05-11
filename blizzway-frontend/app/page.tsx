import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "NEXA", href: "#nexa" },
  { label: "Pathway", href: "#pathway" },
  { label: "Magic Market", href: "#magic-market" },
  { label: "Soul Vault", href: "#soul-vault" },
];

const pathwaySteps = [
  ["Dream", "Clarify who you are becoming and what kind of future feels alive."],
  ["Plan", "Turn ambition into a guided pathway with small weekly actions."],
  ["Grow", "Learn, earn, reflect, and build proof with Guardian Angel AI beside you."],
];

const gardenTracks = [
  "Skill clarity",
  "Communication fluency",
  "Portfolio proof",
  "Exam readiness",
];

const earningSignals = [
  ["First offer", "Package a small service or role-ready proof story."],
  ["Opportunity map", "Compare jobs, internships, freelance paths, and next moves."],
  ["Money rhythm", "Keep credits, goals, and earning actions visible."],
];

const vaultItems = [
  "Achievements",
  "Reflections",
  "Proof notes",
  "Confidence wins",
];

const marketItems = [
  ["Resume Architect", "Profile", "Shapes experience into clear, role-ready stories."],
  ["Interview Studio", "Practice", "Runs warm drills that build confidence without pressure."],
  ["Opportunity Scout", "Launch", "Finds next-fit roles, projects, and practical pathways."],
  ["Learning Mentor", "Growth", "Keeps your Learning Garden focused and calm."],
];

const companions = [
  ["Students", "Choose subjects, skills, colleges, projects, and first proof."],
  ["Professionals", "Upgrade career direction, confidence, resumes, and interviews."],
  ["Aspirants", "Prepare for migration, exams, language, and better opportunities."],
];

const happinessSignals = [
  "Gentle guidance",
  "Visible progress",
  "Parent-trust clarity",
  "Professional momentum",
  "Small daily wins",
  "Hopeful planning",
];

const footerLinks = [
  { label: "Login", href: "/login" },
  { label: "Start", href: "/signup" },
  { label: "Magic Market", href: "/magic-market" },
  { label: "Soul Vault", href: "/soul-vault" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund", href: "/refund" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Blizzway home">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#20164f] text-sm font-black text-white shadow-lg shadow-purple-500/20">
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
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 c7-muted sm:text-lg">{description}</p>
    </div>
  );
}

function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <article className={`c7-card c7-magical-glow p-5 sm:p-6 ${className}`}>{children}</article>;
}

function MiniBadge({ children }: { children: ReactNode }) {
  return <span className="c7-badge">{children}</span>;
}

export default function Home() {
  return (
    <main className="c7-shell overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-black text-slate-600 hover:text-slate-950 sm:inline-flex">
              Login
            </Link>
            <Link href="/signup" className="c7-button-primary">
              Start
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-18 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_50%_0%,rgba(143,92,247,0.22),transparent_52%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <MiniBadge>
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Powered by NEXA, the Guardian Angel AI
            </MiniBadge>
            <h1 className="mt-6 max-w-4xl text-6xl font-black tracking-tight text-slate-950 sm:text-7xl lg:text-8xl">
              Blizzway
            </h1>
            <p className="mt-4 max-w-3xl text-3xl font-black tracking-tight c7-gradient-text sm:text-5xl">
              The Magical Career Pathway
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 c7-muted">
              A premium AI-native ecosystem for students, professionals, and aspirants who want
              career growth to feel clear, hopeful, intelligent, and deeply personal.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="c7-button-primary min-w-44">
                Start Your Pathway
              </Link>
              <a href="#nexa" className="c7-button-secondary min-w-36">
                Meet NEXA
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {["Students", "Professionals", "Aspirants"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-950">{item}</p>
                  <p className="mt-1 text-xs font-semibold c7-muted">Guided with warmth</p>
                </div>
              ))}
            </div>
          </div>

          <div className="c7-card c7-magical-glow p-4 sm:p-5">
            <div className="c7-gradient-panel rounded-[24px] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">
                    NEXA pathway brief
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">Today feels possible.</h2>
                </div>
                <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white ring-1 ring-white/16">
                  Guardian
                </span>
              </div>
              <div className="mt-7 grid gap-3">
                {[
                  ["Pathway clarity", "92%"],
                  ["Learning Garden focus", "4 actions"],
                  ["Earning Universe signal", "2 openings"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                    <p className="text-sm font-semibold text-white/68">{label}</p>
                    <p className="mt-2 text-3xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Dream", "Build", "Rise"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="h-2 w-14 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300" />
                  <p className="mt-4 text-sm font-black text-slate-950">{item}</p>
                  <p className="mt-1 text-xs c7-muted">Pathway stage</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="nexa" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="c7-sidebar rounded-[28px] p-6 shadow-2xl shadow-slate-950/20 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">NEXA Guardian Angel</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              An AI guide that feels intelligent, calm, and emotionally safe.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              NEXA helps students, parents, professionals, and aspirants see the next right
              move without drowning in options.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Understands", "Goals, doubts, strengths, constraints, and family hopes."],
              ["Recommends", "Small next actions across learning, earning, and proof."],
              ["Encourages", "Progress that feels happy, human, and sustainable."],
            ].map(([title, desc]) => (
              <GlowCard key={title}>
                <span className="c7-icon-tile">{title.slice(0, 2).toUpperCase()}</span>
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 c7-muted">{desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section id="pathway" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="My Pathway"
            title="A beautiful command path for becoming career-ready."
            description="My Pathway converts dreams into visible momentum: skills to learn, proof to build, confidence to protect, and opportunities to pursue."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {pathwaySteps.map(([title, desc], index) => (
              <GlowCard key={title}>
                <span className="text-5xl font-black text-indigo-100">0{index + 1}</span>
                <h3 className="mt-5 text-2xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 c7-muted">{desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section id="learning-garden" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="c7-section mx-auto grid max-w-7xl gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <SectionIntro
            align="left"
            eyebrow="Learning Garden"
            title="Learn with purpose, not pressure."
            description="Blizzway turns learning into a garden: skills, communication, exams, projects, and confidence grow in the right season."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {gardenTracks.map((track) => (
              <div key={track} className="rounded-2xl border border-slate-200 bg-white/82 p-5 shadow-sm">
                <span className="c7-icon-tile">{track.slice(0, 2).toUpperCase()}</span>
                <p className="mt-4 text-lg font-black text-slate-950">{track}</p>
                <p className="mt-2 text-sm leading-6 c7-muted">A guided growth lane inside your pathway.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="earning-universe" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <SectionIntro
              align="left"
              eyebrow="Earning Universe"
              title="Connect growth to real opportunity."
              description="From internships and first jobs to freelance ideas and professional upgrades, Earning Universe makes the money side of growth practical and hopeful."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {earningSignals.map(([title, desc]) => (
                <GlowCard key={title}>
                  <h3 className="text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 c7-muted">{desc}</p>
                </GlowCard>
              ))}
            </div>
          </div>
          <div className="c7-gradient-panel rounded-[28px] p-6 shadow-2xl shadow-purple-500/20">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Opportunity orbit</p>
            <p className="mt-4 text-5xl font-black">3x</p>
            <p className="mt-3 text-lg font-semibold leading-8 text-white/72">
              More clarity when learning, proof, and earning actions live in one pathway.
            </p>
          </div>
        </div>
      </section>

      <section id="soul-vault" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1fr] lg:items-center">
          <div className="c7-card p-5 sm:p-6">
            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Soul Vault</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight">Keep the story of your becoming.</h2>
              <p className="mt-4 leading-7 text-white/68">
                A private-feeling space for wins, reflections, proof, and the moments that remind
                a learner they are growing.
              </p>
            </div>
          </div>
          <div>
            <SectionIntro
              align="left"
              eyebrow="Soul Vault"
              title="Trustworthy growth memory for students, parents, and professionals."
              description="Soul Vault makes progress emotionally visible, so confidence has somewhere to live before the world sees the final result."
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              {vaultItems.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/82 p-4 text-center shadow-sm">
                  <p className="font-black text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="magic-market" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionIntro
              align="left"
              eyebrow="Magic Market"
              title="A premium market of growth tools and guided help."
              description="Browse focused experiences for resumes, interviews, learning, earning, exams, migration, and confidence."
            />
            <Link href="/magic-market" className="c7-button-secondary shrink-0">
              Preview Magic Market
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {marketItems.map(([name, tag, desc]) => (
              <GlowCard key={name}>
                <div className="flex items-start justify-between gap-3">
                  <span className="c7-icon-tile">{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {tag}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-black text-slate-950">{name}</h3>
                <p className="mt-3 text-sm leading-6 c7-muted">{desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section id="companions" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="c7-gradient-panel mx-auto max-w-7xl rounded-[30px] p-6 shadow-2xl shadow-indigo-500/20 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Companions</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                The right guide for every kind of path.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">
                Companions are focused AI-native helpers that make Blizzway feel personal,
                capable, and reassuring.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {companions.map(([title, desc]) => (
                <div key={title} className="rounded-2xl bg-white/14 p-5 ring-1 ring-white/14">
                  <p className="text-xl font-black">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="happiness" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Happiness Ecosystem"
            title="Career growth should create energy, not fear."
            description="Blizzway is designed to provide confidence, clarity, and small moments of joy while still feeling premium, serious, and future-ready."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {happinessSignals.map((signal) => (
              <div key={signal} className="rounded-2xl border border-slate-200 bg-white/78 p-5 shadow-sm">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-cyan-300 via-purple-300 to-amber-300" />
                <p className="mt-4 text-lg font-black text-slate-950">{signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="credits" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <SectionIntro
            align="left"
            eyebrow="Credits & Wallet"
            title="A simple wallet for boosts, companions, and premium guidance."
            description="Credits keep the ecosystem flexible. Use them later for focused boosts, Magic Market actions, reviews, and pathway upgrades."
          />
          <GlowCard>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">Wallet teaser</p>
            <p className="mt-4 text-5xl font-black text-slate-950">2,400</p>
            <p className="mt-2 text-sm font-semibold c7-muted">Preview credits</p>
            <div className="mt-6 space-y-3">
              {["Resume boost", "Interview drill", "Companion action"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <span className="font-bold text-slate-700">{item}</span>
                  <span className="font-black text-slate-950">{[120, 180, 60][index]}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="px-4 py-18 sm:px-6 lg:px-8">
        <div className="c7-section c7-magical-glow mx-auto max-w-5xl p-6 text-center sm:p-10">
          <MiniBadge>Blizzway is ready to welcome your next chapter</MiniBadge>
          <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Start building a pathway that feels magical and measurable.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 c7-muted">
            Let NEXA help you turn ambition into a calm, beautiful career journey.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="c7-button-primary min-w-44">
              Start Your Pathway
            </Link>
            <a href="#nexa" className="c7-button-secondary min-w-36">
              Meet NEXA
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/72 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xl text-sm leading-6 c7-muted">
              Powered by NEXA, the Guardian Angel AI for students, professionals, and aspirants.
            </p>
          </div>
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
