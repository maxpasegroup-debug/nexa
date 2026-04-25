"use client";

const testimonials = [
  {
    quote:
      "NEXA assigned tasks to my team before I even woke up. My BDMs know exactly what to do every morning without me calling them.",
    name: "Rajesh M.",
    role: "Real Estate Agency Owner, Kochi",
    initial: "R",
    color: "#7C6FFF",
  },
  {
    quote:
      "We were managing 200 leads on WhatsApp and Excel. BGOS cleaned that up in one day. Now nothing falls through.",
    name: "Priya S.",
    role: "Clinic Manager, Coimbatore",
    initial: "P",
    color: "#22D9A0",
  },
  {
    quote:
      "I used to spend 3 hours every Monday making reports. NEXA does it Sunday night and sends it to me. I just review and approve.",
    name: "Arun T.",
    role: "Digital Agency Founder, Surat",
    initial: "A",
    color: "#F5A623",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-[1000px] px-5 py-24 md:px-12">
      <h2 className="text-center font-heading text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
        Real businesses. Real results.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.name} className="rounded-[14px] border border-white/10 bg-[#13131c] p-7">
            <div className="font-heading text-[64px] font-extrabold leading-[0.5] text-[#7C6FFF]/30">
              “
            </div>
            <p className="mt-6 text-[15px] font-light leading-8 text-[#F0EEF8]">
              {item.quote}
            </p>
            <div className="my-6 h-px bg-white/10" />
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: item.color }}
              >
                {item.initial}
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-white">{item.name}</p>
                <p className="mt-1 text-xs text-[#6B6878]">{item.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-14 text-center">
        <p className="text-sm text-[#6B6878]">
          YourStory · Inc42 · The Ken · Economic Times
        </p>
        <p className="mt-2 text-[11px] text-[#6B6878]">Coming soon.</p>
      </div>
    </section>
  );
}
