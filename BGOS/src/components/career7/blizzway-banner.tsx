"use client";

import { ArrowRight, Check, Crown, Lock } from "lucide-react";
import { type Career7Tier } from "./theme";

type BlizzwayBannerProps = {
  currentTier?: Career7Tier;
  onUpgrade?: () => void;
};

export function BlizzwayBanner({
  currentTier = "STARTER",
  onUpgrade = () => {},
}: BlizzwayBannerProps) {
  const features: { name: string; available: Career7Tier[] }[] = [
    { name: "Advanced Analytics", available: ["PRO", "ELITE"] },
    { name: "Priority Support", available: ["GROWTH", "PRO", "ELITE"] },
    { name: "Unlimited Agents", available: ["ELITE"] },
    { name: "Custom Dashboards", available: ["PRO", "ELITE"] },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 p-8 text-white shadow-lg shadow-indigo-950/20">
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <Crown className="fill-yellow-300 text-yellow-300" size={28} />
          <span className="text-sm font-bold uppercase">Blizzway Premium</span>
        </div>

        <h2 className="mb-3 text-3xl font-bold">Unlock Your Full Potential</h2>
        <p className="mb-6 max-w-2xl text-lg text-white/90">
          Upgrade to Blizzway Premium for exclusive agents, priority support, and personalized learning paths.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const unlocked = feature.available.includes(currentTier);

            return (
              <div key={feature.name} className="flex items-center gap-2">
                {unlocked ? (
                  <Check size={18} className="text-green-300" />
                ) : (
                  <Lock size={18} className="text-white/60" />
                )}
                <span className="text-sm">{feature.name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-indigo-600 transition-colors hover:bg-slate-100"
          >
            Upgrade Now
            <ArrowRight size={18} />
          </button>
          <button className="rounded-xl border-2 border-white px-8 py-3 font-bold text-white transition-colors hover:bg-white/10">
            Compare Plans
          </button>
        </div>

        {currentTier === "STARTER" && (
          <p className="mt-4 text-sm text-white/80">
            You are on the <strong>Starter</strong> plan. Upgrade to unlock premium features.
          </p>
        )}
      </div>
    </div>
  );
}
