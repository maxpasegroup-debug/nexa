"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";

import { getRedirectForRole, isBossRole, isEmployeeRole } from "@/lib/domain";
import { useIsMobile } from "@/hooks/use-device";
import MobileIceLanding from "./mobile-ice-landing";

const features = [
  {
    icon: "⚡",
    title: "Daily AI brief",
    description:
      "NEXA prepares your day before you open your laptop. Tasks, priorities, and one sharp tip — every morning.",
  },
  {
    icon: "🎯",
    title: "Your leads, your pipeline",
    description:
      "Every lead assigned to you in one place. Log calls, update status, set reminders — from any device.",
  },
  {
    icon: "📊",
    title: "Your performance",
    description:
      "See exactly where you stand — targets, conversion rate, team rank. No surprises in review meetings.",
  },
  {
    icon: "🤖",
    title: "NEXA on your side",
    description:
      "Ask NEXA anything about your leads, your tasks, or what to prioritise. Like having a smart manager available 24/7.",
  },
];

const bdmItems = [
  "Lead pipeline with AI scoring",
  "One-tap call logging",
  "Daily task list from NEXA",
  "Target tracker — live",
  "Team ranking this month",
];

const sdeItems = [
  "Task board with sprint view",
  "Bug tracker with severity",
  "Integration health monitor",
  "Escalation feed",
  "Daily dev brief from NEXA",
];

export default function EmployeeLandingPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as string | undefined;

    if (role && isBossRole(role)) {
      await signOut({ redirect: false });
      setLoading(false);
      setError("This portal is for employees. Please use bgos.online.");
      return;
    }

    if (role && isEmployeeRole(role)) {
      router.push(getRedirectForRole(role));
      router.refresh();
      return;
    }

    setLoading(false);
    setError("Unable to verify your workspace access. Please try again.");
  }

  if (isMobile) return <MobileIceLanding />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0F0D] font-sans text-[#EFF5F0]">
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b px-6 py-4 transition duration-300 md:px-10 ${
          scrolled
            ? "border-white/[0.06] bg-[#0A0F0D]/80 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
          <Link href="/" className="font-fraunces text-[20px] font-bold leading-none">
            <span className="text-white">ice</span>
            <span className="text-[#2ECC8A]">connect</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <a href="#how-it-works" className="hidden text-[#6B7D70] transition hover:text-[#EFF5F0] sm:inline">
              How it works
            </a>
            <a href="#your-role" className="hidden text-[#6B7D70] transition hover:text-[#EFF5F0] sm:inline">
              Your role
            </a>
            <a
              href="#signin"
              className="rounded-full bg-[#2ECC8A] px-4 py-2 text-sm font-bold text-[#0A0F0D] transition hover:bg-[#55ddb0]"
            >
              Sign in →
            </a>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center px-6 py-28">
        <div className="pointer-events-none absolute right-[-12%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(46,204,138,0.07),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.65%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22200%22_height=%22200%22_filter=%22url(%23n)%22_opacity=%221%22/%3E%3C/svg%3E')]" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <div className="animate-employee-fade-up rounded-full border border-[#2ECC8A]/40 bg-[#2ECC8A]/5 px-4 py-2 text-xs font-medium text-[#2ECC8A] opacity-0 [animation-delay:0.2s]">
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#2ECC8A] shadow-[0_0_0_6px_rgba(46,204,138,0.12)] animate-pulse" />
            Employee workspace · powered by BGOS
          </div>

          <h1 className="animate-employee-fade-up mt-8 font-fraunces text-[clamp(42px,7vw,80px)] font-light leading-[0.98] tracking-[-2px] opacity-0 [animation-delay:0.4s]">
            <span className="block">Your workspace,</span>
            <span className="block italic text-[#2ECC8A]">always ready.</span>
            <span className="block font-semibold">Show up and do great work.</span>
          </h1>

          <p className="animate-employee-fade-up mt-6 max-w-[480px] text-[17px] font-light leading-7 text-[#6B7D70] opacity-0 [animation-delay:0.6s]">
            iceconnect is your daily work portal. Your leads, your tasks, your
            targets — and NEXA as your AI assistant — all in one place.
          </p>

          <form
            id="signin"
            onSubmit={handleSubmit}
            className="employee-login-card animate-employee-fade-up relative mt-9 w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131a15] p-5 text-left opacity-0 [animation-delay:0.8s]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7D70]">
              Sign in to your workspace
            </p>
            {error ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            ) : null}
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.name@company.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1612] px-4 py-3 text-sm text-[#EFF5F0] outline-none transition placeholder:text-[#6B7D70] focus:border-[#2ECC8A]"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/[0.06] bg-[#0f1612] px-4 py-3 text-sm text-[#EFF5F0] outline-none transition placeholder:text-[#6B7D70] focus:border-[#2ECC8A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-[#2ECC8A] px-4 py-3 text-sm font-bold text-[#0A0F0D] transition hover:bg-[#55ddb0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to workspace →"}
            </button>
            <Link
              href="/forgot-password"
              className="mt-4 block text-center text-sm text-[#6B7D70] transition hover:text-[#EFF5F0]"
            >
              Forgot your password?
            </Link>
          </form>

          <div className="animate-employee-fade-up absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#6B7D70] opacity-0 [animation-delay:1.2s] md:flex">
            Scroll
            <span className="relative h-10 w-px overflow-hidden bg-white/[0.06]">
              <span className="absolute left-0 top-0 h-5 w-px animate-scroll-line bg-[#2ECC8A]" />
            </span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#2ECC8A]">
            What is inside your workspace
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="bg-[#131a15] p-6 transition hover:bg-[#142019]">
                <div className="text-2xl">{feature.icon}</div>
                <h2 className="mt-5 font-fraunces text-[16px] font-bold text-[#EFF5F0]">
                  {feature.title}
                </h2>
                <p className="mt-3 text-[13px] font-light leading-6 text-[#6B7D70]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="your-role" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-fraunces text-[clamp(34px,5vw,58px)] font-light tracking-[-1px]">
              Built for <span className="italic text-[#2ECC8A]">your role</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-sm font-light leading-6 text-[#6B7D70]">
              Different job. Different dashboard. Everything you need, nothing
              you do not.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <RoleCard
              tag="Sales — BDM"
              tagClass="border-[#2ECC8A]/30 bg-[#2ECC8A]/10 text-[#2ECC8A]"
              title="Close more deals"
              description="Your entire sales workflow in one place. NEXA tells you who to call first."
              items={bdmItems}
            />
            <RoleCard
              tag="Technical — SDE"
              tagClass="border-violet-400/30 bg-violet-400/10 text-violet-300"
              title="Build without chaos"
              description="Tasks, bugs, sprints — organised and prioritised. NEXA flags what matters most."
              items={sdeItems}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-8 text-[11px] text-[#6B7D70]">
        <div className="mx-auto grid max-w-6xl gap-5 text-center md:grid-cols-3 md:text-left">
          <div className="font-fraunces text-[18px] font-bold">
            <span className="text-white">ice</span>
            <span className="text-[#2ECC8A]">connect</span>
          </div>
          <p className="md:text-center">Employee workspace · part of the BGOS platform</p>
          <div className="flex justify-center gap-4 md:justify-end">
            <a href="https://bgos.online" className="transition hover:text-[#EFF5F0]">bgos.online →</a>
            <a href="#" className="transition hover:text-[#EFF5F0]">Privacy</a>
            <a href="mailto:support@iceconnect.in" className="transition hover:text-[#EFF5F0]">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function RoleCard({
  tag,
  tagClass,
  title,
  description,
  items,
}: {
  tag: string;
  tagClass: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <article className="rounded-2xl border border-white/[0.06] bg-[#131a15] p-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#2ECC8A]/45">
      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${tagClass}`}>
        {tag}
      </span>
      <h3 className="mt-5 font-fraunces text-2xl font-bold">{title}</h3>
      <p className="mt-3 text-sm font-light leading-6 text-[#6B7D70]">
        {description}
      </p>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-[#EFF5F0]">
            <span className="h-2 w-2 rounded-full bg-[#2ECC8A]" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
