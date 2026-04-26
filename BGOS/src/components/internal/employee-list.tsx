"use client";

import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";

export type EmployeeListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  defaultPassword: boolean;
  lastLoginAt: string | null;
};

type EmployeeListProps = {
  employees: EmployeeListItem[];
  onResetPassword: () => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(value: string | null) {
  if (!value) return "No activity yet";
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function roleColor(role: string) {
  return role === "SDE"
    ? "bg-[#22D9A0] text-[#07120e]"
    : "bg-[#7C6FFF] text-white";
}

function roleBadge(role: string) {
  return role === "SDE"
    ? "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]"
    : "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c6c1ff]";
}

function EmployeeCard({
  employee,
  onResetPassword,
}: {
  employee: EmployeeListItem;
  onResetPassword: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function resetPassword() {
    setLoading(true);
    setMessage("");
    setError("");
    const response = await fetch(
      `/api/internal/employees/${employee.id}/reset-password`,
      { method: "POST" },
    );
    setLoading(false);

    if (!response.ok) {
      setError("Could not reset password.");
      return;
    }

    setMessage("Password reset. Email sent.");
    setConfirming(false);
    onResetPassword();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${roleColor(
              employee.role,
            )}`}
          >
            {initials(employee.name)}
          </div>
          <div className="min-w-0">
            <p className="font-heading text-[13px] font-bold text-white">
              {employee.name}
            </p>
            <p className="mt-1 truncate text-[11px] text-zinc-500">
              {employee.email}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleBadge(
                employee.role,
              )}`}
            >
              {employee.role}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {employee.defaultPassword ? (
            <span className="rounded-full bg-[#F5A623]/10 px-2 py-1 text-[10px] font-bold text-[#F5A623]">
              Password not changed
            </span>
          ) : null}
          <p className="text-[11px] text-zinc-500">
            {timeAgo(employee.lastLoginAt)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-[#7C6FFF]/40 hover:text-white"
              aria-label={`Reset password for ${employee.name}`}
              title="Reset password"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled
              className="rounded-lg border border-white/10 p-2 text-zinc-700"
              aria-label="Remove employee"
              title="Coming soon"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {confirming ? (
        <div className="mt-4 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-3">
          <p className="text-sm text-[#F5A623]">
            Reset {employee.name}&apos;s password to 123456789? They will be
            emailed.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void resetPassword()}
              disabled={loading}
              className="rounded-lg bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-[#1a1200] disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300"
            >
              No
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-lg bg-[#22D9A0]/10 px-3 py-2 text-xs text-[#22D9A0]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EmployeeList({
  employees,
  onResetPassword,
}: EmployeeListProps) {
  if (employees.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-8 text-center text-sm text-zinc-500">
        No employees yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onResetPassword={onResetPassword}
        />
      ))}
    </div>
  );
}
