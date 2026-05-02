"use client";

type MobileBossTeamMember = {
  id: string;
  name: string;
  email?: string;
  role: string;
  active?: boolean;
  leadsThisWeek?: number;
  tasksDone?: number;
  phone?: string | null;
};

type MobileBossTeamProps = {
  members: MobileBossTeamMember[];
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MobileBossTeam({ members }: MobileBossTeamProps) {
  return (
    <main className="mobile-page min-h-screen bg-[var(--bg)] px-4 pt-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-extrabold">Team</h1>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{members.length} people in your workspace</p>
        </div>
        <a href="/boss/team#invite" className="rounded-full bg-[#22D9A0] px-4 py-2 font-heading text-xs font-bold text-[#070709]">
          Add
        </a>
      </header>

      <section className="mt-4 space-y-3">
        {members.map((member) => (
          <article key={member.id} className="rounded-[16px] border border-white/10 bg-[var(--card)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF]/20 font-heading text-sm font-bold text-[#c9c4ff]">
                {initials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-heading text-[13px] font-bold">{member.name}</h2>
                  {member.active ? <span className="h-2 w-2 rounded-full bg-[#22D9A0]" title="Online" /> : null}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c9c4ff]">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-zinc-600">{member.active ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="font-heading text-lg font-bold text-[#7C6FFF]">{member.leadsThisWeek ?? 0}</p>
                <p className="text-[10px] text-[var(--muted)]">Leads this week</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="font-heading text-lg font-bold text-[#22D9A0]">{member.tasksDone ?? 0}</p>
                <p className="text-[10px] text-[var(--muted)]">Tasks done</p>
              </div>
            </div>
            <a
              href={member.phone ? `https://wa.me/${member.phone.replace(/\D/g, "")}` : `mailto:${member.email ?? ""}`}
              className="mt-3 block h-10 rounded-xl border border-white/10 text-center font-heading text-xs font-bold leading-10 text-[#22D9A0]"
            >
              Message →
            </a>
          </article>
        ))}
        {members.length === 0 ? (
          <div className="rounded-[16px] border border-white/10 bg-[var(--card)] p-5 text-center text-xs text-zinc-500">
            Invite your first team member to start tracking performance.
          </div>
        ) : null}
      </section>
    </main>
  );
}
