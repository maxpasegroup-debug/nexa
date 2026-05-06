"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LandingCtaButton } from "./landing-cta-button";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#070709]/90 backdrop-blur-[20px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-1 px-2 md:gap-2 md:px-12">
        <Link href="/" className="shrink-0 font-heading text-[18px] font-extrabold md:text-[22px]">
          <span className="text-white">BG</span>
          <span className="text-[#7C6FFF]">OS</span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-1.5 md:gap-4">
          {[
            ["Marketplace", "/marketplace"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[10px] font-medium text-[#A5A1B3] transition hover:text-white md:text-sm"
            >
              {label}
            </a>
          ))}
          <LandingCtaButton className="shrink-0 rounded-md bg-[#7C6FFF] px-2.5 py-2 text-[10px] font-medium text-white transition hover:bg-[#9186FF] md:px-5 md:text-sm" />
        </div>
      </nav>
    </header>
  );
}
