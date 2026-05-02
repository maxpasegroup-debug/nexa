"use client";

import { LandingCtaButton } from "./landing-cta-button";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-[800px] px-5 py-28 text-center md:px-12">
      <div className="rounded-[24px] border border-[#7C6FFF]/30 bg-[radial-gradient(circle_at_center,rgba(124,111,255,0.06),transparent_70%)] px-6 py-16 md:px-12">
        <h2 className="font-heading text-[clamp(32px,5vw,52px)] font-extrabold leading-tight text-white">
          Ready to bring your leads and team into one dashboard?
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-lg font-light leading-8 text-[#A5A1B3]">
          Share a few details and the BGOS team will help you map your first workspace.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <LandingCtaButton className="rounded-lg bg-[#7C6FFF] px-10 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#9186FF]" />
          <a
            href="mailto:hello@bgos.in"
            className="rounded-lg border border-white/15 px-10 py-4 text-sm font-bold text-white transition hover:border-[#7C6FFF]/50"
          >
            Talk to our team
          </a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-[13px] text-[#A5A1B3]">
          <span>7-day free trial</span>
          <span>Setup during trial</span>
          <span>Choose a plan before billing</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
