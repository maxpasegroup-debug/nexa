"use client";

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-[800px] px-5 py-28 text-center md:px-12">
      <div className="rounded-[24px] border border-[#7C6FFF]/30 bg-[radial-gradient(circle_at_center,rgba(124,111,255,0.06),transparent_70%)] px-6 py-16 md:px-12">
        <h2 className="font-heading text-[clamp(32px,5vw,52px)] font-extrabold leading-tight tracking-[-0.04em] text-white">
          Ready to stop running your business manually?
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-lg font-light leading-8 text-[#6B6878]">
          NEXA sets up your business in 3 minutes. No technical knowledge needed.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-[#7C6FFF] px-10 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#9186FF]"
          >
            Get started free →
          </Link>
          <a
            href="mailto:hello@bgos.in"
            className="rounded-lg border border-white/15 px-10 py-4 text-sm font-bold text-white transition hover:border-[#7C6FFF]/50"
          >
            Talk to our team
          </a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-[13px] text-[#6B6878]">
          <span>✓ 14-day free trial</span>
          <span>✓ No credit card</span>
          <span>✓ BDM helps you onboard</span>
        </div>
      </div>
    </section>
  );
}
