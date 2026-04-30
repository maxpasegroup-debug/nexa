"use client";

import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

type User = {
  name: string;
  role: string;
  businessName: string;
};

type BuildRow = {
  id: string;
  companyName: string;
  plan: string | null;
  status: string;
  assignedAt: string;
};

function statusBadge(status: string) {
  if (status === "SDE_BUILDING") return { label: "Building", className: "bg-amber-400/10 text-amber-300" };
  if (status === "CLARIFICATION_NEEDED") return { label: "Clarification needed", className: "bg-red-500/10 text-red-300" };
  if (status === "SDE_APPROVED") return { label: "Approved", className: "bg-[#22D9A0]/10 text-[#22D9A0]" };
  return { label: "Submitted", className: "bg-white/5 text-zinc-400" };
}

export function WorkspaceBuildsPage({ user, builds }: { user: User; builds: BuildRow[] }) {
  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar role="SDE" userName={user.name} businessName={user.businessName} />
      <Navbar title="Workspace builds" userName={user.name} role={user.role} />
      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section>
            <h1 className="font-heading text-2xl font-bold">Workspace builds</h1>
            <p className="mt-1 text-sm text-zinc-500">Review intelligent onboarding summaries and approve workspaces.</p>
          </section>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Company name</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Assigned time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {builds.length ? builds.map((build) => {
                  const badge = statusBadge(build.status);
                  return (
                    <tr key={build.id} className="border-b border-white/5">
                      <td className="px-4 py-4 font-semibold text-white">{build.companyName}</td>
                      <td className="text-zinc-400">{build.plan ?? "Not selected"}</td>
                      <td><span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span></td>
                      <td className="text-zinc-500">{new Date(build.assignedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                      <td><Link href={`/sde/workspaces/${build.id}`} className="rounded-xl bg-[#7C6FFF] px-3 py-2 text-xs font-bold text-white">Open build</Link></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-500">No build sessions assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
