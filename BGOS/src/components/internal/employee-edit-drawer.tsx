"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { InternalEmployee } from "@/components/internal/employee-card";
import { toast } from "@/components/ui/toast";

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedAt: string;
  revenueTarget: string;
};

function initialState(employee: InternalEmployee): FormState {
  return {
    name: employee.name,
    email: employee.email,
    phone: employee.phone ?? "",
    role: employee.role,
    status: employee.status,
    joinedAt: employee.joinedAt.slice(0, 10),
    revenueTarget: String(employee.revenueTarget ?? 0),
  };
}

export function EmployeeEditDrawer({
  employee,
  isOpen,
  onClose,
  onSave,
}: {
  employee: InternalEmployee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<FormState | null>(employee ? initialState(employee) : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    setForm(employee ? initialState(employee) : null);
    setError("");
    setConfirmName("");
  }, [employee]);

  const changed = useMemo(() => {
    if (!employee || !form) return false;
    return JSON.stringify(form) !== JSON.stringify(initialState(employee));
  }, [employee, form]);

  if (!isOpen || !employee || !form) return null;
  const activeEmployee = employee;
  const activeForm = form;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/internal/employees/${activeEmployee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: activeForm.name,
        email: activeForm.email,
        phone: activeForm.phone,
        role: activeForm.role,
        status: activeForm.status,
        isActive: activeForm.status === "ACTIVE",
        joinedAt: activeForm.joinedAt,
        revenueTarget: Number(activeForm.revenueTarget) || 0,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(data.error ?? "Could not save changes.");
      return;
    }
    toast.success("Changes saved");
    onSave();
  }

  async function resetPassword() {
    if (!window.confirm(`${activeEmployee.name} will need to log in with BGOS@123456. Continue?`)) return;
    const response = await fetch(`/api/internal/employees/${activeEmployee.id}/reset-password`, { method: "POST" });
    if (!response.ok) return toast.error("Could not reset password");
    toast.success("Password reset");
  }

  async function archive() {
    const response = await fetch(`/api/internal/employees/${activeEmployee.id}/archive`, { method: "POST" });
    if (!response.ok) return toast.error("Could not archive employee");
    toast.success("Employee archived");
    onSave();
  }

  async function remove() {
    const response = await fetch(`/api/internal/employees/${activeEmployee.id}`, { method: "DELETE" });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) return toast.error(data.error ?? "Could not delete employee");
    toast.success("Employee deleted");
    onSave();
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/50">
      <aside className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-white/10 bg-[#0d0d12] text-white shadow-2xl md:w-[440px]">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h2 className="font-heading text-lg font-bold">Edit employee</h2>
            <p className="mt-1 text-xs text-zinc-500">{employee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={!changed || saving}
              className="rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          {error ? <div className="rounded-xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 p-3 text-sm text-red-100">{error}</div> : null}

          <section>
            <h3 className="font-heading text-sm font-bold">Basic info</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Name" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" />
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Display name" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" />
              <input value={form.email} onChange={(event) => update("email", event.target.value)} onBlur={async () => {
                const response = await fetch(`/api/internal/employees?email=${encodeURIComponent(form.email)}`);
                const data = (await response.json().catch(() => ({}))) as { exists?: boolean; user?: { id?: string } };
                if (data.exists && data.user?.id !== employee.id) setError("Email already exists.");
              }} placeholder="Email" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" />
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="WhatsApp number" className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#7C6FFF]" />
            </div>
          </section>

          <section>
            <h3 className="font-heading text-sm font-bold">Role and access</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select value={form.role} onChange={(event) => update("role", event.target.value)} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                <option value="BDM">BDM - Sales</option>
                <option value="SDE">SDE - Technical</option>
                <option value="BOSS">BOSS - Manager</option>
                <option value="OWNER">OWNER</option>
              </select>
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm">
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <input type="date" value={form.joinedAt} onChange={(event) => update("joinedAt", event.target.value)} className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            </div>
            {form.role !== employee.role ? <p className="mt-2 text-xs text-[#F5A623]">Changing role will affect what this person can see and do in BGOS.</p> : null}
          </section>

          {form.role === "BDM" ? (
            <section>
              <h3 className="font-heading text-sm font-bold">Performance</h3>
              <input value={form.revenueTarget} onChange={(event) => update("revenueTarget", event.target.value)} type="number" className="mt-3 w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
              <p className="mt-2 text-xs text-zinc-500">Currently ₹{Number(employee.revenueTarget || 0).toLocaleString("en-IN")}/month</p>
            </section>
          ) : null}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="font-heading text-sm font-bold">Activity summary</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-zinc-400">
              <p>Last login<br /><b className="text-white">{employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleDateString("en-IN") : "Never"}</b></p>
              <p>Total leads<br /><b className="text-white">{employee.totalLeads}</b></p>
              <p>This month<br /><b className="text-white">₹{Math.round(employee.commissionThisMonth).toLocaleString("en-IN")}</b></p>
              <p>Open tickets<br /><b className="text-white">{employee.ticketsAssigned}</b></p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-[#FF6B6B]/30 bg-[#FF6B6B]/5 p-4">
            <h3 className="font-heading text-sm font-bold text-[#FF6B6B]">Danger zone</h3>
            <button onClick={() => void resetPassword()} className="w-full rounded-xl bg-[#F5A623]/20 px-3 py-2 text-sm font-bold text-[#F5A623]">Reset to BGOS@123456</button>
            <button onClick={() => void archive()} className="w-full rounded-xl bg-zinc-500/20 px-3 py-2 text-sm font-bold text-zinc-200">Archive account</button>
            <input value={confirmName} onChange={(event) => setConfirmName(event.target.value)} placeholder={`Type ${employee.name} to confirm`} className="w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm" />
            <button disabled={confirmName !== employee.name} onClick={() => void remove()} className="w-full rounded-xl bg-[#FF6B6B] px-3 py-2 text-sm font-bold text-black disabled:opacity-40">Delete permanently</button>
          </section>
        </div>
      </aside>
    </div>
  );
}
