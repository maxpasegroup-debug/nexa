import { Career7Badge, Career7Button, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const packages = [
  ["Starter Glow", "500", "$9", "Quick boosts"],
  ["Pathway Pack", "1,400", "$19", "Best value"],
  ["Aurora Pro", "3,200", "$39", "Companion heavy"],
  ["Dreamscape Elite", "7,500", "$79", "Premium pathway"],
];

const transactions = [
  ["Resume Cocoa", "Spent", "-120", "Today"],
  ["Welcome credits", "Earned", "+500", "Yesterday"],
  ["Interview Truffle", "Spent", "-180", "May 6"],
  ["Soul Vault bonus", "Earned", "+80", "May 5"],
];

export default function WalletPage() {
  return (
    <Career7DashboardShell
      activeHref="/wallet"
      title="Wallet"
      description="Dummy credits balance, top-up packages, and usage history. Payments are not implemented."
      walletCredits={2400}
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Credits balance</p>
          <p className="mt-4 text-7xl font-black">2,400</p>
          <p className="mt-3 text-lg font-semibold text-white/70">Dummy credits available for boosts, companions, and pathway previews.</p>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA wallet note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Spend where confidence grows.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">Payments are intentionally disabled. This is a visual wallet layer only.</p>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {packages.map(([name, credits, price, note]) => (
          <Career7Card key={name} as="article" className="c7-lift-card">
            <Career7Badge tone={note === "Best value" ? "purple" : "slate"}>{note}</Career7Badge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-3 text-4xl font-black text-slate-950">{credits}</p>
            <p className="mt-1 text-sm c7-muted">credits preview</p>
            <p className="mt-5 text-2xl font-black text-slate-950">{price}</p>
            <Career7Button type="button" disabled className="mt-5 w-full opacity-60">Payments later</Career7Button>
          </Career7Card>
        ))}
      </section>

      <Career7Card as="section" className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dummy transactions</p>
        <div className="mt-6 grid gap-3">
          {transactions.map(([name, type, amount, date]) => (
            <div key={`${name}-${date}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-black text-slate-950">{name}</p>
                <p className="text-sm c7-muted">{date}</p>
              </div>
              <Career7Badge tone={type === "Earned" ? "emerald" : "slate"}>{type}</Career7Badge>
              <p className={`text-lg font-black ${type === "Earned" ? "text-emerald-600" : "text-slate-950"}`}>{amount}</p>
            </div>
          ))}
        </div>
      </Career7Card>
    </Career7DashboardShell>
  );
}
