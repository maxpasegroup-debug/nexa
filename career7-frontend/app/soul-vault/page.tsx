import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const memories = [
  ["Dream", "Become a globally confident product professional."],
  ["Reflection", "I speak more clearly when I practice slowly first."],
  ["Growth memory", "Finished first portfolio proof note."],
  ["Goal", "Earn from one freelance project this quarter."],
];

const board = ["Calm workspace", "Premium role", "Family pride", "Global confidence"];

export default function SoulVaultPage() {
  return (
    <Career7DashboardShell
      activeHref="/soul-vault"
      title="Soul Vault"
      description="A secure-feeling private profile for dreams, reflections, growth memory, and vision boards."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Secure vault messaging</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Your confidence deserves a home.</h2>
          <p className="mt-4 leading-7 text-white/72">
            Dummy vault content previews a private profile that remembers dreams, proof, and becoming.
          </p>
          <div className="mt-6 rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
            <p className="font-black">Private by design</p>
            <p className="mt-2 text-sm text-white/70">Visual placeholder only. No encryption or storage connected yet.</p>
          </div>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Private profile</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Arun&apos;s growth identity</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">Product thinker, portfolio builder, global career aspirant.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Hopeful", "Focused", "Premium path"].map((item) => <Career7Badge key={item} tone="slate">{item}</Career7Badge>)}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.78fr]">
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Dreams, goals, reflections</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {memories.map(([type, text]) => (
              <div key={text} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Career7Badge tone="cyan">{type}</Career7Badge>
                <p className="mt-4 text-sm leading-6 text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </Career7Card>
        <Career7Card as="section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Vision board</p>
          <div className="mt-6 grid gap-3">
            {board.map((item) => (
              <div key={item} className="rounded-2xl bg-gradient-to-r from-indigo-50 to-cyan-50 p-4">
                <p className="font-black text-slate-950">{item}</p>
              </div>
            ))}
          </div>
        </Career7Card>
      </section>
    </Career7DashboardShell>
  );
}
