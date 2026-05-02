"use client";

const productLinks = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070709] px-5 pb-8 pt-16 md:px-12">
      <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-[1.5fr_repeat(2,1fr)]">
        <div>
          <div className="font-heading text-[22px] font-extrabold">
            <span className="text-white">BG</span>
            <span className="text-[#7C6FFF]">OS</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-[#A5A1B3]">
            BGOS helps Indian SME owners manage leads, follow-ups, team work,
            and daily NEXA recommendations from one dashboard.
          </p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold text-white">Product</h3>
          <div className="mt-4 space-y-3">
            {productLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="block text-sm text-[#A5A1B3] transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold text-white">Contact</h3>
          <div className="mt-4 space-y-3">
            <a
              href="mailto:hello@bgos.in"
              className="block text-sm text-[#A5A1B3] transition hover:text-white"
            >
              hello@bgos.in
            </a>
            <p className="text-sm text-[#A5A1B3]">Made in India for Indian SMEs.</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1100px] flex-col justify-between gap-3 border-t border-white/10 pt-8 text-xs text-[#A5A1B3] md:flex-row">
        <p>Copyright 2026 BGOS. All rights reserved.</p>
        <p>Early access product with guided setup.</p>
      </div>
    </footer>
  );
}
