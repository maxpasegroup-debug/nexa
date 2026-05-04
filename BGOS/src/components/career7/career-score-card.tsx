"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import { type Career7Tier, tierColors } from "./theme";

type CareerScoreCardProps = {
  score?: number;
  maxScore?: number;
  tier?: Career7Tier;
  trend?: number;
};

export function CareerScoreCard({
  score = 0,
  maxScore = 100,
  tier = "STARTER",
  trend = 0,
}: CareerScoreCardProps) {
  const percentage = maxScore > 0 ? Math.min(100, Math.max(0, (score / maxScore) * 100)) : 0;
  const colors = tierColors[tier];

  return (
    <div className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">Career Score</p>
          <h3 className={`text-4xl font-bold ${colors.text}`}>{score}</h3>
          <p className="mt-1 text-xs text-slate-500">of {maxScore} possible</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${colors.gradient} p-3 shadow-md`}>
          <TrendingUp className="text-white" size={24} />
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-white/80">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-block rounded-full border border-white bg-white/80 px-3 py-1 text-xs font-semibold ${colors.text}`}>
          {tier}
        </span>
        {trend !== 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <ArrowUpRight size={16} />
            <span className="text-sm font-medium">
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
