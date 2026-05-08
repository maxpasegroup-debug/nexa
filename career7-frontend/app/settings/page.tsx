import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const groups: { title: string; items: string[] }[] = [
  { title: "Profile", items: ["Display name: Arun", "Stage: Career builder", "Goal: Premium product role"] },
  { title: "Notifications", items: ["Daily NEXA brief", "Weekly pathway summary", "Boost reminders"] },
  { title: "Privacy", items: ["Soul Vault private", "Profile visibility limited", "Parent-safe summaries"] },
  { title: "NEXA preferences", items: ["Tone: Calm and hopeful", "Depth: Practical", "Frequency: Gentle"] },
];

export default function SettingsPage() {
  return (
    <Career7DashboardShell
      activeHref="/settings"
      title="Settings"
      description="Dummy profile, notification, privacy, and NEXA preference controls."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Preference center</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Keep your pathway calm and trustworthy.</h2>
          <p className="mt-4 leading-7 text-white/72">No settings are saved yet. This is the complete visual control layer.</p>
        </Career7GradientPanel>
        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Profile placeholder</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Arun Blizzway Explorer</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">Student/professional profile controls will appear here later.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Preview account", "No backend", "Dummy controls"].map((item) => <Career7Badge key={item} tone="slate">{item}</Career7Badge>)}
          </div>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        {groups.map(({ title, items }) => (
          <Career7Card key={title} as="section">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
            <div className="mt-5 grid gap-3">
              {items.map((item, index) => (
                <label key={item} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-sm font-bold text-slate-700">{item}</span>
                  <input type="checkbox" defaultChecked={index !== 2} className="h-5 w-5 rounded border-slate-300" />
                </label>
              ))}
            </div>
          </Career7Card>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
