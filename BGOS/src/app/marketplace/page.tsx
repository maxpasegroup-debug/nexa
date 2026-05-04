import Link from "next/link";

const agents = [
  { icon: "⚡", name: "Sales Booster", industry: "Universal", price: "₹1,499", desc: "Automate leads from WhatsApp, Instagram, Facebook, Email and SMS" },
  { icon: "💬", name: "Wazzup", industry: "Universal", price: "₹999", desc: "NEXA inside your WhatsApp — replies, follows up, qualifies leads" },
  { icon: "🧾", name: "TaxMate", industry: "Finance", price: "₹799", desc: "GST filing, TDS tracking, and invoice automation" },
  { icon: "👥", name: "PeopleDesk", industry: "Universal", price: "₹799", desc: "HR automation — attendance, payroll, and team management" },
  { icon: "🏗️", name: "SiteSync", industry: "Construction", price: "₹1,499", desc: "Project tracking for solar and construction companies" },
  { icon: "🏥", name: "CareLoop", industry: "Healthcare", price: "₹1,299", desc: "Appointments, reminders, and patient follow-ups automated" },
  { icon: "🎓", name: "EduFlow", industry: "Education", price: "₹999", desc: "Batch management, fee tracking, and parent communication" },
  { icon: "🏫", name: "ClassMate", industry: "Schools", price: "₹1,299", desc: "School operations — attendance, homework, and reports" },
  { icon: "🏢", name: "PropPilot", industry: "Real Estate", price: "₹1,299", desc: "Property listings, broker network, and lead pipeline" },
  { icon: "🏪", name: "StockSense", industry: "Retail", price: "₹999", desc: "Inventory alerts, order tracking, and dealer management" },
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

export default function MarketplacePage() {
  return (
    <main className="marketing-page">
      <MarketingHeader />
      <section className="bg-[#05050A] py-24 text-center">
        <div className="marketing-shell">
          <h1 className="text-4xl font-extrabold text-white md:text-6xl">AI Agents for every business</h1>
          <p className="mt-5 text-lg text-white/55">Plug in. Automate. Grow.</p>
        </div>
      </section>

      <section className="bg-[#05050A] pb-24">
        <div className="marketing-shell grid gap-5 md:grid-cols-2">
          {agents.map((agent) => (
            <article key={agent.name} className="agent-store-card">
              <div className="flex items-start gap-4">
                <span className="text-[40px] leading-none">{agent.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="marketing-heading text-base font-extrabold text-white">{agent.name}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
                      {agent.industry}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-white/50">{agent.desc}</p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
                <p className="font-bold text-white">{agent.price}<span className="text-sm text-white/45">/month</span></p>
                <p className="text-right text-[10px] italic text-white/35">Onboarding charges apply</p>
              </div>
              <Link href="/login" className="mt-5 inline-flex text-xs font-bold text-[#a78bfa]">Learn more →</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
