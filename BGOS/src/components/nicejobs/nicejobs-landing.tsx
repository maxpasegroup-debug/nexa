import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Coins,
  FileSignature,
  Headphones,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const opportunities = [
  {
    name: "BGOS Micro-Franchise",
    detail: "Train on the BGOS sales motion and earn commissions on validated referrals.",
    commission: "Up to 30%",
    duration: "7 day track",
  },
  {
    name: "Partner App Referrals",
    detail: "Promote approved partner products with ready-to-use sales resources.",
    commission: "15-25%",
    duration: "3-5 day track",
  },
  {
    name: "Local Growth Associate",
    detail: "Build a local referral pipeline with monthly payout visibility.",
    commission: "Performance based",
    duration: "Guided launch",
  },
];

const steps = [
  { icon: BriefcaseBusiness, label: "Choose", text: "Browse approved micro-franchise opportunities." },
  { icon: FileSignature, label: "Agree", text: "Apply and accept the digital MOU terms." },
  { icon: BookOpenCheck, label: "Train", text: "Complete audio, video, PDF, and asset-based learning." },
  { icon: Coins, label: "Earn", text: "Track validated referrals and monthly payouts." },
];

export function NiceJobsLanding() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#151515]">
      <nav className="border-b border-[#151515]/10 bg-[#f7f7f2]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#151515] text-sm font-black text-white">
              NJ
            </span>
            <span className="text-lg font-black tracking-tight">NICEJOBS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login?businessModel=nicejobs"
              className="hidden text-sm font-semibold text-[#333] hover:text-[#151515] sm:inline"
            >
              Login
            </Link>
            <Link
              href="/register?businessModel=nicejobs"
              className="inline-flex items-center gap-2 rounded-md bg-[#151515] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2b2b2b]"
            >
              Start <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-[#151515]/10">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[url('/images/nexa.jpeg')] bg-cover bg-center opacity-95 lg:block" />
        <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[#151515]/45 lg:block" />
        <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#151515]/15 bg-white px-3 py-2 text-sm font-bold">
              <ShieldCheck size={16} />
              BGOS-powered referral workbench
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-[#151515] sm:text-6xl lg:text-7xl">
              NICEJOBS
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#454545] sm:text-xl">
              A standalone micro-franchise brand where people train, promote approved
              opportunities, and earn commissions from validated partner sales.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register?businessModel=nicejobs"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1c7c54] px-5 py-3 text-sm font-black text-white transition hover:bg-[#166843]"
              >
                Join NICEJOBS <ArrowRight size={17} />
              </Link>
              <Link
                href="/nicejobs"
                className="inline-flex items-center justify-center rounded-md border border-[#151515]/20 bg-white px-5 py-3 text-sm font-black text-[#151515] transition hover:border-[#151515]/40"
              >
                View opportunities
              </Link>
            </div>
          </div>

          <div className="grid gap-3 lg:pl-16">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="rounded-lg border border-[#151515]/10 bg-white/90 p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#e2f6ed] text-[#1c7c54]">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h2 className="text-base font-black">{step.label}</h2>
                      <p className="mt-1 text-sm leading-6 text-[#555]">{step.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase text-[#1c7c54]">
              <TrendingUp size={16} /> Available franchises
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Start with approved opportunities.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#555]">
            This is the Phase 1 shell. The next phases connect real opportunity,
            training, MOU, referral, and payout records to the shared BGOS database.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {opportunities.map((opportunity) => (
            <article key={opportunity.name} className="rounded-lg border border-[#151515]/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <BadgeCheck className="text-[#1c7c54]" size={22} />
                <span className="rounded-md bg-[#f0c85a]/30 px-2.5 py-1 text-xs font-black text-[#6a4a00]">
                  {opportunity.commission}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-black">{opportunity.name}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#555]">{opportunity.detail}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#333]">
                <Headphones size={16} /> {opportunity.duration}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
