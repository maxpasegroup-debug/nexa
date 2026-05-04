import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "₹799",
    users: "Up to 3 users",
    features: ["AI-powered CRM", "NEXA as your CEO", "Lead management", "Basic pipelines", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "₹2,499",
    users: "Up to 15 users",
    features: ["Everything in Starter", "All role dashboards", "Marketplace access", "Advanced pipelines", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    price: "₹6,999",
    users: "Up to 50 users",
    features: ["Everything in Growth", "Unlimited pipelines", "API access", "Dedicated support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    users: "Unlimited users",
    features: ["Everything in Scale", "White label", "SLA guarantee", "All agents free", "Dedicated manager"],
    cta: "Talk to us",
    popular: false,
  },
];

function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="marketing-shell flex h-16 items-center justify-between">
        <Link href="/" className="marketing-heading text-xl font-extrabold text-white">BGOS</Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-white/70">
          <Link href="/marketplace" className="transition hover:text-white">Marketplace</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
          <Link href="/login" className="rounded-lg bg-[#7C3AED] px-4 py-2 font-semibold text-white transition hover:bg-[#6D28D9]">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}

export default function PricingPage() {
  return (
    <main className="marketing-page">
      <MarketingHeader />
      <section className="bg-[#05050A] py-24 text-center">
        <div className="marketing-shell">
          <h1 className="text-4xl font-extrabold text-white md:text-6xl">Simple pricing. No surprises.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/55">Start free for 7 days. No credit card required.</p>
        </div>
      </section>

      <section className="bg-[#05050A] pb-20">
        <div className="marketing-shell grid gap-5 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`marketing-card flex flex-col p-6 ${plan.popular ? "border-[#7C3AED]/60 bg-[#7C3AED]/10 lg:scale-[1.03]" : ""}`}
            >
              <div className="flex min-h-[32px] items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold text-white">{plan.name}</h2>
                {plan.popular ? <span className="rounded-full bg-[#7C3AED] px-2.5 py-1 text-[10px] font-bold text-white">★ Most Popular</span> : null}
              </div>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                {plan.price !== "Custom" ? <span className="ml-1 text-sm text-white/40">/month</span> : null}
              </div>
              <p className="mt-3 text-sm font-medium text-white/55">{plan.users}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white/65">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2"><span className="text-[#a78bfa]">✓</span>{feature}</li>
                ))}
              </ul>
              <p className="mt-6 text-[10px] italic text-white/35">Onboarding charges apply</p>
              <Link href="/login" className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-bold ${plan.popular ? "bg-[#7C3AED] text-white" : "border border-white/10 text-white"}`}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-white/40">All plans include 18% GST · Autopay · Cancel anytime</p>
      </section>

      <section className="bg-[#080810] py-20">
        <div className="marketing-shell max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold text-white">FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              ["Is there a free trial?", "Yes. 7 days free, no credit card needed."],
              ["What are onboarding charges?", "A one-time setup fee based on your team size and requirements."],
              ["Can I change my plan?", "Yes, upgrade or downgrade anytime."],
            ].map(([question, answer]) => (
              <details key={question} className="marketing-card px-5 py-4">
                <summary className="cursor-pointer font-semibold text-white">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-white/55">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
