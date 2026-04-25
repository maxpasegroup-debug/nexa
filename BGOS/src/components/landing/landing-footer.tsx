"use client";

const columns = [
  ["Product", "Features", "Pricing", "Roadmap", "Changelog"],
  ["Company", "About", "Blog", "Careers", "Contact"],
  ["Legal", "Privacy Policy", "Terms of Service", "Refund Policy", "GST Info"],
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070709] px-5 pb-8 pt-16 md:px-12">
      <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="font-heading text-[22px] font-extrabold">
            <span className="text-white">BG</span>
            <span className="text-[#7C6FFF]">OS</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-[#6B6878]">
            AI Operating System for Indian SMEs.
          </p>
          <div className="mt-5 flex gap-3">
            {["T", "in", "IG"].map((item) => (
              <a
                key={item}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-[#6B6878] transition hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        {columns.map(([title, ...links]) => (
          <div key={title}>
            <h3 className="font-heading text-sm font-bold text-white">{title}</h3>
            <div className="mt-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-sm text-[#6B6878] transition hover:text-white"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-[1100px] flex-col justify-between gap-3 border-t border-white/10 pt-8 text-xs text-[#6B6878] md:flex-row">
        <p>© 2025 BGOS. All rights reserved.</p>
        <p>Made with ❤️ in India</p>
      </div>
    </footer>
  );
}
