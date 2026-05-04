"use client";

import { Lock, Trophy, Unlock } from "lucide-react";

const vaultItems = [
  { title: "React Architecture Badge", date: "Apr 26, 2026" },
  { title: "Portfolio Launch Certificate", date: "Apr 18, 2026" },
  { title: "Mentor Sprint Completion", date: "Apr 9, 2026" },
  { title: "Open Source Contributor", date: "Mar 27, 2026" },
];

const lockedFeatures = [
  { title: "Verified Skill Passport", level: "Pro tier" },
  { title: "Recruiter-ready Vault Link", level: "Level 8" },
  { title: "Premium Certificates", level: "Blizzway Pro" },
  { title: "Private Mentor Notes", level: "Elite tier" },
];

export default function GrowthVaultPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Growth Vault</h1>
        <p className="mt-2 text-slate-600">Secure storage for achievements and credentials.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Certificates", value: "12", hint: "Earned credentials", color: "text-indigo-600" },
          { label: "Achievements", value: "28", hint: "Milestones reached", color: "text-cyan-600" },
          { label: "Vault Tier", value: "Growth", hint: "Current level", color: "text-purple-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h3 className="mb-2 text-sm font-semibold text-slate-500">{item.label}</h3>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Your Vault</h2>
        <div className="space-y-3">
          {vaultItems.map((item) => (
            <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Trophy className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="text-sm text-slate-600">Unlocked on {item.date}</p>
                </div>
              </div>
              <Unlock className="text-green-600" size={20} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Locked Features</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lockedFeatures.map((feature) => (
            <div key={feature.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-700">{feature.title}</p>
                <p className="text-sm text-slate-500">Unlock at {feature.level}</p>
              </div>
              <Lock className="text-slate-400" size={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
