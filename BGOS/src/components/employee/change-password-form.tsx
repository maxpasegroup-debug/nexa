"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const { update } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword === "123456789") {
      setError("Please choose a more secure password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords must match.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/employee/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Could not change password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("Password changed successfully. Keep it safe.");
    await update({ user: { defaultPassword: false } });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <h2 className="font-heading text-lg font-bold text-white">
        Change password
      </h2>
      <form onSubmit={handleSubmit} className="mt-5 max-w-md space-y-4">
        <Input
          label="Current password"
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <Input
          label="New password"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-4 py-3 text-sm text-[#22D9A0]">
            {success}
          </p>
        ) : null}
        <Button type="submit" loading={loading}>
          Change password
        </Button>
      </form>
    </section>
  );
}
