"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      <nav className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 md:px-12">
        <Link href="/" className="font-heading text-[22px] font-extrabold">
          <span className="text-white">BG</span>
          <span className="text-[#7C6FFF]">OS</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            ["Features", "#features"],
            ["How it works", "#how-it-works"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-[#6B6878] transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/login"
            className="rounded-md px-2 py-2 text-sm font-medium text-white transition hover:text-[#a89fff] md:border md:border-white/15 md:px-5"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-[#7C6FFF] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#9186FF] md:px-5"
          >
            Get started free
          </Link>
        </div>
      </nav>
    </header>
  );
}
