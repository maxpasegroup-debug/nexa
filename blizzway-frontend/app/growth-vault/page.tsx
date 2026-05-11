import {
  BlizzwayBadge,
  BlizzwayCard,
  BlizzwayGradientPanel,
} from "@/components/blizzway";
import { BlizzwayDashboardShell } from "../dashboard-shell";

const timeline = [
  {
    range: "6 months",
    title: "Confident communication",
    detail: "Complete English practice loops, publish two proof projects, and sharpen resume stories.",
  },
  {
    range: "1 year",
    title: "Role-ready portfolio",
    detail: "Build a visible body of work and interview with clear, measurable career narratives.",
  },
  {
    range: "3 years",
    title: "Premium career leverage",
    detail: "Move into higher-value roles, mentor peers, and use companions for strategic opportunity discovery.",
  },
  {
    range: "5 years",
    title: "Independent growth engine",
    detail: "Own a resilient skill stack, strong savings rhythm, and a trusted professional reputation.",
  },
];

const skillGaps = [
  { skill: "Executive English", level: "68%", note: "Needs daily speaking reps" },
  { skill: "Portfolio storytelling", level: "54%", note: "Add clearer proof and outcomes" },
  { skill: "Interview confidence", level: "61%", note: "Practice behavioral loops" },
];

const notes = [
  "I want work that compounds into freedom, not just a better title.",
  "My strongest weeks happen when Learning Garden and Earning Universe both have one clear action.",
  "Proof beats pressure. Build the asset before chasing the opportunity.",
];

function SectionHeading({
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
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 c7-muted">{description}</p> : null}
    </div>
  );
}

export default function GrowthVaultPage() {
  return (
    <BlizzwayDashboardShell
      activeHref="/growth-vault"
      eyebrow="Soul Vault"
      title="Soul Vault"
      description="A private archive for career identity, proof, notes, and long-range vision."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <BlizzwayGradientPanel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Private Soul Vault
              </p>
              <h2 className="mt-3 max-w-3xl text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">
                Your career identity, protected and ready to grow.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Store your vision, skill gaps, proof notes, and personal reflections in one
                premium space. Keep passwords, payment details, and official identity numbers outside your vault.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/14 p-5 ring-1 ring-white/14 lg:min-w-56">
              <p className="text-sm font-bold text-white/70">Vault status</p>
              <p className="mt-2 text-3xl font-black sm:text-4xl">Private</p>
              <p className="mt-2 text-sm text-white/66">Beta privacy mode</p>
            </div>
          </div>
        </BlizzwayGradientPanel>

        <BlizzwayCard as="section">
          <SectionHeading
            eyebrow="Encrypted profile"
            title="Protected profile"
            description="This beta profile view keeps growth context scoped to your Blizzway workspace."
          />
          <div className="mt-5 rounded-[24px] border border-indigo-100 bg-indigo-50 p-5">
            <p className="break-words font-mono text-sm leading-7 text-indigo-800">
              ENCRYPTED_PROFILE::Blizzway::ARUN::VISION_LOCKED::PROOF_READY
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <BlizzwayBadge tone="emerald">Private by design</BlizzwayBadge>
            <BlizzwayBadge tone="slate">Sensitive secrets excluded</BlizzwayBadge>
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <BlizzwayCard as="section">
          <SectionHeading
            eyebrow="Digital profile"
            title="Career snapshot"
            description="A beta summary of the person Guardian Angel AI is helping you become."
          />
          <div className="mt-6 space-y-3">
            {[
              ["Target path", "AI-enabled career growth"],
              ["Current focus", "Resume proof and English confidence"],
              ["Preferred pace", "Steady daily progress"],
              ["Credit balance", "2,400 available"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayCard as="section">
          <SectionHeading
            eyebrow="Vision Board"
            title="Long-range timeline"
            description="A personal map from near-term clarity to five-year independence."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {timeline.map((item) => (
              <article key={item.range} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <BlizzwayBadge tone="cyan">{item.range}</BlizzwayBadge>
                <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 c7-muted">{item.detail}</p>
              </article>
            ))}
          </div>
        </BlizzwayCard>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <BlizzwayCard as="section">
          <SectionHeading
            eyebrow="Skill gaps"
            title="What needs attention"
            description="Beta gap cards that help Guardian Angel AI recommend the next growth action."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {skillGaps.map((gap) => (
              <article key={gap.skill} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-black text-slate-950">{gap.skill}</h3>
                  <BlizzwayBadge tone="slate" className="self-start">{gap.level}</BlizzwayBadge>
                </div>
                <div className="mt-4 h-3 rounded-full bg-white">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500"
                    style={{ width: gap.level }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 c7-muted">{gap.note}</p>
              </article>
            ))}
          </div>
        </BlizzwayCard>

        <BlizzwayGradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Guardian Angel AI suggestion
          </p>
          <h2 className="mt-3 text-[1.65rem] font-black leading-tight tracking-tight sm:text-3xl">
            Convert one private note into a visible proof asset.
          </h2>
          <p className="mt-4 leading-7 text-white/72">
            Guardian Angel AI suggests turning your strongest reflection into a portfolio story,
            then linking it to Resume Architect for a cleaner role narrative.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">Next action</p>
              <p className="mt-2 text-sm text-white/70">Write one proof note</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
              <p className="font-black">Best companion</p>
              <p className="mt-2 text-sm text-white/70">Resume Architect</p>
            </div>
          </div>
        </BlizzwayGradientPanel>
      </section>

      <section className="mt-5">
        <BlizzwayCard as="section">
          <SectionHeading
            eyebrow="Personal growth notes"
            title="Private reflections"
            description="Soft, personal notes for motivation and future Guardian Angel AI context."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {notes.map((note, index) => (
              <article key={note} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black text-indigo-600">NOTE 0{index + 1}</p>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">{note}</p>
              </article>
            ))}
          </div>
        </BlizzwayCard>
      </section>
    </BlizzwayDashboardShell>
  );
}
