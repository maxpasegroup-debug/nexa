"use client";

import { useEffect, useState } from "react";

import { LandingCtaButton } from "./landing-cta-button";

const messages = [
  "Lead conversion dropped 18%. I've reassigned 12 hot leads to your BDM team.",
  "Ravi hasn't followed up with 6 leads in 3 days. Sending him a task now.",
  "Your business health score improved from 62 to 74 this week. Revenue is up.",
  "3 proposals have been pending for 5+ days. Want me to send follow-up emails?",
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const current = messages[index];

    if (typed.length < current.length) {
      const timer = window.setTimeout(
        () => setTyped(current.slice(0, typed.length + 1)),
        35,
      );
      return () => window.clearTimeout(timer);
    }

    const pause = window.setTimeout(() => {
      setFading(true);
      window.setTimeout(() => {
        setTyped("");
        setIndex((value) => (value + 1) % messages.length);
        setFading(false);
      }, 260);
    }, 3000);

    return () => window.clearTimeout(pause);
  }, [index, typed]);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden px-5 pb-20 pt-[120px] text-center md:px-12">
      <div className="pointer-events-none absolute left-1/2 top-[-200px] z-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,111,255,0.10)_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-120px] z-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(34,217,160,0.06)_0%,transparent_66%)]" />
      <div className="landing-noise pointer-events-none absolute inset-0 z-0 opacity-[0.18]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="landing-fade mx-auto inline-flex rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/[0.08] px-3.5 py-1 text-xs text-[#a89fff] [animation-delay:0.2s]">
          AI CRM and team dashboard for Indian SMEs
        </div>

        <h1 className="mt-7 font-heading text-[clamp(38px,11vw,56px)] font-extrabold leading-[1.05] md:text-[clamp(56px,7vw,82px)]">
          <span className="landing-up block text-white [animation-delay:0.4s]">
            Run leads, tasks,
          </span>
          <span className="landing-up block text-[#7C6FFF] [animation-delay:0.48s]">
            and follow-ups in one place.
          </span>
        </h1>

        <p className="landing-up mx-auto mt-7 max-w-[620px] text-lg font-light leading-[1.65] text-[#A5A1B3] [animation-delay:0.6s]">
          BGOS gives business owners a clean operating dashboard for CRM, team
          execution, inbox follow-ups, and daily AI recommendations from NEXA.
        </p>
        <p className="landing-up mx-auto mt-3 max-w-[620px] text-sm font-light leading-6 text-[#F0EEF8] [animation-delay:0.68s]">
          BGOS is your business dashboard. NEXA is the AI assistant inside it.
        </p>

        <div className="landing-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:0.8s] sm:flex-row">
          <LandingCtaButton className="rounded-lg bg-[#7C6FFF] px-8 py-3.5 text-[15px] font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#9186FF]" />
          <a
            href="#how-it-works"
            className="rounded-lg border border-white/15 px-8 py-3.5 text-[15px] font-medium text-white transition hover:-translate-y-0.5 hover:border-[#7C6FFF]/50 hover:text-[#a89fff]"
          >
            See how it works
          </a>
        </div>

        <div className="landing-fade mt-8 [animation-delay:1s]">
          <p className="text-center text-xs font-light text-[#A5A1B3]">
            Guided setup during trial | Our team contacts you within 2 hours
          </p>
        </div>

        <div className="landing-up mx-auto mt-12 max-w-[560px] rounded-2xl border border-white/10 bg-[#13131c] p-5 text-left shadow-2xl shadow-[#7C6FFF]/5 [animation-delay:1.2s]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 rounded-full bg-[#22D9A0]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#22D9A0]" />
              </span>
              <span className="font-heading font-bold text-white">NEXA</span>
            </div>
            <span className="text-[11px] font-bold text-[#22D9A0]">Live</span>
          </div>
          <p
            className={`min-h-[72px] text-[15px] leading-7 text-[#F0EEF8] transition-opacity duration-300 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            {typed}
            <span className="landing-cursor ml-1 inline-block h-5 w-px translate-y-1 bg-[#7C6FFF]" />
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              ["84 leads managed", "#7C6FFF"],
              ["12 tasks assigned", "#22D9A0"],
              ["3 alerts resolved", "#F5A623"],
            ].map(([label, color]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-[#A5A1B3]"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
        }
        .landing-up,
        .landing-fade {
          opacity: 0;
          animation: fadeUp 0.75s ease forwards;
        }
        .landing-fade {
          animation-name: fadeIn;
        }
        .landing-cursor {
          animation: blink 0.8s step-end infinite;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
