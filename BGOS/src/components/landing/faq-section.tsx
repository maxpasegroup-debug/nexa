"use client";

const faqs = [
  {
    question: "Who is this for?",
    answer: "Indian service businesses with 5-50 employees that need clearer lead follow-up, team visibility, and owner-level control.",
  },
  {
    question: "How long does setup take?",
    answer: "We set up your workspace with you in 1-2 days, based on your current sales process and team structure.",
  },
  {
    question: "Do I need to change my current tools?",
    answer: "No. BGOS works alongside WhatsApp and your current workflow, then brings the important work into one dashboard.",
  },
  {
    question: "Is my data safe?",
    answer: "Yes. Your data stays private to your workspace and is used only to run your BGOS dashboard and NEXA recommendations.",
  },
  {
    question: "How does the trial and billing work?",
    answer: "You get a 7-day free trial. You choose a plan before billing starts, and you can cancel anytime.",
  },
];

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-[1000px] px-5 py-24 md:px-12">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7C6FFF]">
          FAQ
        </p>
        <h2 className="mt-4 font-heading text-4xl font-extrabold text-white md:text-5xl">
          Questions before setup.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-base font-light leading-7 text-[#A5A1B3]">
          A few practical answers before you bring your leads and team into BGOS.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {faqs.map((item) => (
          <article
            key={item.question}
            className="rounded-[14px] border border-white/10 bg-[#13131c] p-6"
          >
            <h3 className="font-heading text-base font-bold text-white">
              {item.question}
            </h3>
            <p className="mt-3 text-sm font-light leading-7 text-[#A5A1B3]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
