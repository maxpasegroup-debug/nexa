"use client";

import { Brain, Sparkles } from "lucide-react";

type NexaInsightCardProps = {
  title?: string;
  insight?: string;
  recommendation?: string;
  category?: string;
};

export function NexaInsightCard({
  title = "AI Insight",
  insight = "Based on your learning patterns, we recommend focusing on technical skills this month.",
  recommendation = "Complete 2-3 technical courses and apply them in real projects.",
  category = "Learning Path",
}: NexaInsightCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_22px_55px_rgba(79,70,229,0.14)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-3">
            <Brain className="text-indigo-600" size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600">{category}</p>
            <h3 className="text-sm font-bold text-slate-950">{title}</h3>
          </div>
        </div>
        <Sparkles className="text-cyan-500" size={20} />
      </div>

      <div className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <p className="text-sm leading-relaxed text-slate-700">{insight}</p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Recommended Action</p>
        <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          {recommendation}
        </p>
      </div>

      <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        Apply Recommendation
      </button>
    </div>
  );
}
