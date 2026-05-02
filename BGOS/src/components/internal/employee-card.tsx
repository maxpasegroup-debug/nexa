"use client";

import { toast } from "@/components/ui/toast";

export type InternalEmployee = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  active: boolean;
  isActive: boolean;
  joinedAt: string;
  lastLoginAt?: string | null;
  totalLeads: number;
  activeLeads: number;
  commissionThisMonth: number;
  buildsCount: number;
  activeBuilds: number;
  ticketsAssigned: number;
  ticketsResolved: number;
  revenueTarget: number;
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function roleGradient(role: string) {
  if (role === "BDM") return "from-[#22D9A0] to-[#0ea572]";
  if (role === "SDE") return "from-[#F5A623] to-[#7C6FFF]";
  return "from-[#7C6FFF] to-[#22D9A0]";
}

export function EmployeeCard({
  employee,
  onEdit,
  onRefresh,
}: {
  employee: InternalEmployee;
  onEdit: (employee: InternalEmployee) => void;
  onRefresh: () => void;
}) {
  const archived = employee.status === "ARCHIVED" || !employee.active;

  async function resetPassword() {
    if (!window.confirm(`Reset ${employee.name}'s password to BGOS@123456?`)) return;
    const response = await fetch(`/api/internal/employees/${employee.id}/reset-password`, { method: "POST" });
    if (!response.ok) return toast.error("Could not reset password");
    toast.success("Password reset to BGOS@123456");
  }

  async function archive() {
    if (!window.confirm(`Archive ${employee.name}? Open leads will be reassigned.`)) return;
    const response = await fetch(`/api/internal/employees/${employee.id}/archive`, { method: "POST" });
    if (!response.ok) return toast.error("Could not archive employee");
    toast.success("Employee archived");
    onRefresh();
  }

  async function unarchive() {
    const response = await fetch(`/api/internal/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE", isActive: true }),
    });
    if (!response.ok) return toast.error("Could not unarchive employee");
    toast.success("Employee restored");
    onRefresh();
  }

  async function remove() {
    if (!window.confirm(`Delete ${employee.name} permanently?`)) return;
    const response = await fetch(`/api/internal/employees/${employee.id}`, { method: "DELETE" });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) return toast.error(data.error ?? "Could not delete employee");
    toast.success("Employee deleted");
    onRefresh();
  }

  return (
    <article className={`cursor-pointer rounded-[14px] border border-white/10 bg-[#13131c] p-4 transition hover:border-[#7C6FFF]/60 ${archived ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${roleGradient(employee.role)} text-sm font-bold text-black`}>
            {initials(employee.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-bold text-white">{employee.name}</h3>
            <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{employee.role}</span>
            <p className="mt-1 truncate text-[11px] text-zinc-500">{employee.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-zinc-400"><span className={`mr-1 inline-block h-2 w-2 rounded-full ${archived ? "bg-zinc-500" : "bg-[#22D9A0]"}`} />{archived ? "Archived" : "Active"}</p>
          <p className="mt-1 text-[10px] text-zinc-600">{new Date(employee.joinedAt).toLocaleDateString("en-IN")}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {(employee.role === "SDE"
          ? [
              ["Builds", employee.buildsCount, "text-[#22D9A0]"],
              ["Active", employee.activeBuilds, "text-[#7C6FFF]"],
              ["Resolved", employee.ticketsResolved, "text-zinc-300"],
            ]
          : [
              ["Leads", employee.totalLeads, "text-[#7C6FFF]"],
              ["Open", employee.activeLeads, "text-[#22D9A0]"],
              ["Earned", `₹${Math.round(employee.commissionThisMonth).toLocaleString("en-IN")}`, "text-[#F5A623]"],
            ]).map(([label, value, color]) => (
          <div key={String(label)} className="rounded-xl bg-white/[0.04] p-2">
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-[10px] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {archived ? (
          <>
            <button onClick={unarchive} className="col-span-2 rounded-xl bg-[#22D9A0]/15 px-2 py-2 text-xs font-bold text-[#22D9A0]">Unarchive</button>
            <button onClick={remove} className="rounded-xl bg-[#FF6B6B]/15 px-2 py-2 text-xs font-bold text-[#FF6B6B]">Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(employee)} className="rounded-xl bg-white/10 px-2 py-2 text-xs font-bold">Edit</button>
            <button onClick={() => void resetPassword()} className="rounded-xl bg-[#F5A623]/15 px-2 py-2 text-xs font-bold text-[#F5A623]">Reset PW</button>
            <button onClick={() => void archive()} className="rounded-xl bg-zinc-500/15 px-2 py-2 text-xs font-bold text-zinc-300">Archive</button>
          </>
        )}
      </div>
    </article>
  );
}
