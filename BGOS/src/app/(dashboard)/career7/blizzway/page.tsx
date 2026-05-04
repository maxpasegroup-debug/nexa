"use client";

import { BlizzwayBanner } from "@/components/career7";
import { Check, Crown, X } from "lucide-react";

const premiumFeatures = [
  { name: "Advanced Analytics", starter: false, pro: true, elite: true },
  { name: "Priority Support", starter: false, pro: true, elite: true },
  { name: "Premium Agents", starter: false, pro: true, elite: true },
  { name: "Custom Dashboards", starter: false, pro: true, elite: true },
  { name: "API Access", starter: false, pro: false, elite: true },
  { name: "Team Collaboration", starter: false, pro: false, elite: true },
  { name: "Advanced Reporting", starter: false, pro: true, elite: true },
  { name: "Dedicated Manager", starter: false, pro: false, elite: true },
];

export default function BlizzwayPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Blizzway Premium</h1>
        <p className="mt-2 text-slate-600">Premium features for accelerated career growth.</p>
      </div>

      <BlizzwayBanner currentTier="STARTER" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h3 className="mb-2 text-2xl font-bold text-slate-950">Starter</h3>
          <p className="mb-6 text-4xl font-bold text-slate-950">Free</p>
          <ul className="mb-8 space-y-3">
            {["Basic dashboard", "5 free agents", "Community support"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-700">
                <Check size={18} className="text-green-600" />
                {item}
              </li>
            ))}
            <li className="flex items-center gap-2 text-slate-400">
              <X size={18} className="text-red-400" />
              Advanced analytics
            </li>
          </ul>
          <button className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200">
            Current Plan
          </button>
        </div>

        <div className="relative rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50 to-purple-50 p-8 shadow-md">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-bold text-white">MOST POPULAR</span>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-slate-950">Pro</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-950">Rs. 499</span>
            <p className="text-sm text-slate-600">/month</p>
          </div>
          <ul className="mb-8 space-y-3">
            {["Everything in Starter", "Advanced analytics", "20+ agents", "Priority support"].map((item) => (
              <li key={item} className="flex items-center gap-2 font-medium text-slate-950">
                <Check size={18} className="text-indigo-600" />
                {item}
              </li>
            ))}
          </ul>
          <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-bold text-white transition-opacity hover:opacity-90">
            Upgrade to Pro
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h3 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-950">
            <Crown size={24} className="text-yellow-500" />
            Elite
          </h3>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-950">Rs. 1,299</span>
            <p className="text-sm text-slate-600">/month</p>
          </div>
          <ul className="mb-8 space-y-3">
            {["Everything in Pro", "Unlimited agents", "API access", "Dedicated manager"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-slate-700">
                <Check size={18} className="text-yellow-500" />
                {item}
              </li>
            ))}
          </ul>
          <button className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200">
            Contact Sales
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h2 className="mb-8 text-2xl font-bold text-slate-950">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-4 text-left font-bold text-slate-950">Feature</th>
                <th className="px-4 py-4 text-center font-bold text-slate-700">Starter</th>
                <th className="px-4 py-4 text-center font-bold text-indigo-600">Pro</th>
                <th className="px-4 py-4 text-center font-bold text-yellow-600">Elite</th>
              </tr>
            </thead>
            <tbody>
              {premiumFeatures.map((feature) => (
                <tr key={feature.name} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-950">{feature.name}</td>
                  <td className="px-4 py-4 text-center">
                    {feature.starter ? (
                      <Check className="mx-auto text-green-600" size={20} />
                    ) : (
                      <X className="mx-auto text-slate-300" size={20} />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {feature.pro ? (
                      <Check className="mx-auto text-indigo-600" size={20} />
                    ) : (
                      <X className="mx-auto text-slate-300" size={20} />
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {feature.elite ? (
                      <Check className="mx-auto text-yellow-600" size={20} />
                    ) : (
                      <X className="mx-auto text-slate-300" size={20} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
