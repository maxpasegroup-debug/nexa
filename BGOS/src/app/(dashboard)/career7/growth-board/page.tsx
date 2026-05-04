"use client";

import { GrowthBoardPanel } from "@/components/career7";

export default function GrowthBoardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Learning & Earning Growth Board</h1>
        <p className="mt-2 text-slate-600">Track progress, skill growth, and earning momentum.</p>
      </div>

      <GrowthBoardPanel />
    </div>
  );
}
