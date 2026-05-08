import { Career7Badge, Career7Card, Career7GradientPanel } from "@/components/career7";
import { Career7DashboardShell } from "../dashboard-shell";

const companions = [
  ["Language Lumina", "Language training", "Daily fluency drills with gentle correction.", "76%"],
  ["IELTS Oracle", "Exam coaching", "Band-focused practice plan and confidence map.", "64%"],
  ["Skill Sprout", "Skill development", "Role-specific skill ladder with proof tasks.", "58%"],
  ["Study Rhythm", "Study streaks", "Keeps your weekly learning habit alive.", "9 days"],
];

const streaks = [
  ["Communication", "9 day streak"],
  ["Portfolio proof", "4 tasks this week"],
  ["Exam readiness", "2 mock drills"],
];

export default function LearningGardenPage() {
  return (
    <Career7DashboardShell
      activeHref="/learning-garden"
      title="Learning Garden"
      description="A calm, premium learning space for language, exams, skill development, and study streaks."
    >
      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Career7GradientPanel>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Learning companions</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Grow skills like a garden, not a grind.</h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/72">
            Dummy companions organize language, exam, and career skills into joyful practice loops.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {streaks.map(([title, value]) => (
              <div key={title} className="rounded-2xl bg-white/14 p-4 ring-1 ring-white/14">
                <p className="font-black">{title}</p>
                <p className="mt-2 text-sm text-white/70">{value}</p>
              </div>
            ))}
          </div>
        </Career7GradientPanel>

        <Career7Card as="section" className="c7-magical-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">NEXA learning note</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Practice speaking before polishing documents.</h2>
          <p className="mt-3 text-sm leading-6 c7-muted">
            A confident introduction will make your resume and interviews feel more natural.
          </p>
        </Career7Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {companions.map(([name, category, description, progress]) => (
          <Career7Card key={name} as="article" variant="companion" className="c7-lift-card">
            <Career7Badge tone="cyan">{category}</Career7Badge>
            <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
            <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
            <div className="mt-5 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: progress.includes("%") ? progress : "88%" }} />
            </div>
            <p className="mt-3 text-sm font-black text-slate-700">{progress}</p>
          </Career7Card>
        ))}
      </section>
    </Career7DashboardShell>
  );
}
