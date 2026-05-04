"use client";

import { Edit2, Lightbulb } from "lucide-react";

type VisionBoardCardProps = {
  visionStatement?: string;
  milestones?: { year: number; goal: string }[];
};

export function VisionBoardCard({
  visionStatement = "Build a thriving career through continuous growth and impact",
  milestones = [
    { year: 2026, goal: "Complete 10 courses" },
    { year: 2027, goal: "Achieve Pro tier" },
    { year: 2028, goal: "Become an industry leader" },
  ],
}: VisionBoardCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-3">
            <Lightbulb className="text-purple-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-950">Vision Board</h3>
        </div>
        <button
          type="button"
          className="rounded-xl p-2 transition-colors hover:bg-slate-100"
          aria-label="Edit vision board"
        >
          <Edit2 size={18} className="text-slate-600" />
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        <p className="text-sm italic leading-relaxed text-slate-700">&quot;{visionStatement}&quot;</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-500">Your Journey</p>
        {milestones.map((milestone, index) => (
          <div key={`${milestone.year}-${milestone.goal}`} className="flex gap-4">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
                {index + 1}
              </div>
              {index < milestones.length - 1 && (
                <div className="absolute left-4 top-8 h-8 w-0.5 bg-gradient-to-b from-cyan-300 to-transparent" />
              )}
            </div>
            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-950">{milestone.year}</p>
              <p className="text-xs text-slate-600">{milestone.goal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
