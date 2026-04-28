"use client";

type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  dealsThisMonth: number;
  totalThisMonth: number;
  trend: "up" | "down" | "same" | string;
};

type LeaderboardProps = {
  leaderboard: LeaderboardRow[];
  currentUserId: string;
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function rankLabel(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

function trendIcon(trend: string) {
  if (trend === "up") return <span className="text-[#22D9A0]">▲</span>;
  if (trend === "down") return <span className="text-[#FF6B6B]">▼</span>;
  return <span className="text-zinc-500">→</span>;
}

export function Leaderboard({ leaderboard, currentUserId }: LeaderboardProps) {
  const currentUser = leaderboard.find((row) => row.userId === currentUserId);
  const visible = leaderboard.slice(0, 6);
  const rows =
    currentUser && !visible.some((row) => row.userId === currentUserId)
      ? [...visible.slice(0, 5), currentUser]
      : visible;
  const topTotal = Math.max(...leaderboard.map((row) => row.totalThisMonth), 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5 text-white">
      <h2 className="font-heading text-lg font-bold">This month&apos;s ranking 🏆</h2>

      <div className="mt-5 space-y-3">
        {rows.length > 0 ? (
          rows.map((row) => {
            const isYou = row.userId === currentUserId;
            const width = Math.max(4, (row.totalThisMonth / topTotal) * 100);
            return (
              <div
                key={`${row.rank}-${row.userId}`}
                className={`rounded-xl border px-4 py-3 ${
                  isYou
                    ? "border-[#22D9A0]/30 bg-[#22D9A0]/10"
                    : "border-white/10 bg-[#0e0e13]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-sm font-bold">
                    {rankLabel(row.rank)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-white">{row.name}</p>
                      {isYou ? (
                        <span className="rounded-full bg-[#22D9A0] px-2 py-0.5 text-[10px] font-bold text-black">
                          YOU
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#22D9A0]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-white">{money(row.totalThisMonth)}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-bold text-zinc-400">
                        {row.dealsThisMonth} deals
                      </span>
                      {trendIcon(row.trend)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-zinc-500">
            Rankings appear after the first commission is earned.
          </div>
        )}
      </div>

      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-zinc-500">
        Resets on the 1st of every month. Slab bonuses paid within 24 hours of achieving.
      </p>
    </section>
  );
}
