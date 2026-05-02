"use client";

const trustItems = [
  {
    title: "Early access, built with operators",
    desc: "BGOS is being shaped with real owner-led workflows: leads, follow-ups, team tasks, inbox work, and the daily reviews founders actually need.",
  },
  {
    title: "A guided setup, not a blank account",
    desc: "Share your current sales process and our team helps map your first workspace so the product starts with your actual business structure.",
  },
  {
    title: "Founder-led product support",
    desc: "You are not buying a faceless tool. Early customers get direct implementation feedback loops so BGOS improves around practical SME needs.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-[1000px] px-5 py-24 md:px-12">
      <h2 className="text-center font-heading text-4xl font-extrabold text-white md:text-5xl">
        Built honestly, with the first customers.
      </h2>
      <p className="mx-auto mt-4 max-w-[620px] text-center text-base font-light leading-7 text-[#A5A1B3]">
        BGOS is early-stage software with hands-on setup support. The promise is simple: help owner-led teams bring scattered sales and operations work into one clear dashboard.
      </p>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {trustItems.map((item) => (
          <article key={item.title} className="rounded-[14px] border border-white/10 bg-[#13131c] p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C6FFF]/15 font-heading text-sm font-extrabold text-[#a89fff]">
              OK
            </div>
            <h3 className="mt-6 font-heading text-lg font-bold text-white">
              {item.title}
            </h3>
            <p className="mt-3 text-[15px] font-light leading-8 text-[#A5A1B3]">
              {item.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
