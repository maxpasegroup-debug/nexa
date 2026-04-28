"use client";

import { useEffect } from "react";

type SlabAchievement = {
  id: string;
  slabName: string;
  bonusAmt: number;
};

type SlabCelebrationProps = {
  achievement: SlabAchievement | null;
  onDismiss: () => void;
};

const slabEmoji: Record<string, string> = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  DIAMOND: "💎",
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function SlabCelebration({
  achievement,
  onDismiss,
}: SlabCelebrationProps) {
  useEffect(() => {
    if (!achievement) return;
    const timeout = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  const emoji = slabEmoji[achievement.slabName] ?? "🏆";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#070709]/90 px-4 text-white backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 34 }).map((_, index) => (
          <span
            key={index}
            className="bde-confetti absolute top-[-20px] h-3 w-1.5 rounded-full"
            style={{
              left: `${(index * 29) % 100}%`,
              backgroundColor: ["#22D9A0", "#7C6FFF", "#F5A623", "#FF6B6B"][
                index % 4
              ],
              animationDelay: `${(index % 10) * 0.12}s`,
              animationDuration: `${2.8 + (index % 7) * 0.22}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#13131c] p-8 text-center shadow-2xl shadow-black/40">
        <div className="text-6xl">{emoji}</div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#22D9A0]">
          {achievement.slabName} slab
        </p>
        <h2 className="mt-3 font-heading text-[28px] font-bold">
          You unlocked {achievement.slabName}!
        </h2>
        <p className="mt-4 font-heading text-2xl font-bold text-[#22D9A0]">
          {money(achievement.bonusAmt)} bonus earned
        </p>
        <p className="mt-3 text-sm text-zinc-500">NEXA has notified your boss</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#5ee0b0]"
        >
          Dismiss
        </button>
      </div>

      <style jsx>{`
        .bde-confetti {
          animation-name: bdeConfettiFall;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
          animation-iteration-count: infinite;
        }

        @keyframes bdeConfettiFall {
          0% {
            opacity: 0;
            transform: translate3d(0, -20px, 0) rotate(0deg);
          }

          10% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate3d(40px, 110vh, 0) rotate(540deg);
          }
        }
      `}</style>
    </div>
  );
}
