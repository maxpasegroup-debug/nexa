"use client";

import { FormEvent, useState } from "react";

import { Input } from "@/components/ui/input";

type Role = "BDM" | "SDE";

type AddEmployeeFormProps = {
  onSuccess: () => void;
  onClose: () => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddEmployeeForm({ onSuccess, onClose }: AddEmployeeFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("BDM");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError("");
    setError("");
    setSuccess("");

    if (!emailPattern.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/internal/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (response.status === 400 && data.error?.toLowerCase().includes("email")) {
        setEmailError("This email already has an account.");
        return;
      }
      setError(data.error ?? "Could not create employee account.");
      return;
    }

    setSuccess(`Account created. Welcome email sent to ${email}.`);
    setName("");
    setEmail("");
    setRole("BDM");
    onSuccess();
    window.setTimeout(onClose, 900);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e13] p-5">
      {success ? (
        <p className="mb-4 rounded-xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-4 py-3 text-sm text-[#22D9A0]">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError("");
          }}
          error={emailError}
          required
        />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-200">Role</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("BDM")}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                role === "BDM"
                  ? "border-[#7C6FFF] bg-[#7C6FFF]/15 text-white"
                  : "border-white/10 bg-[#13131c] text-zinc-400 hover:text-white"
              }`}
            >
              <span className="block text-sm font-bold">BDM</span>
              <span className="mt-1 block text-xs">Sales</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("SDE")}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                role === "SDE"
                  ? "border-[#22D9A0] bg-[#22D9A0]/15 text-white"
                  : "border-white/10 bg-[#13131c] text-zinc-400 hover:text-white"
              }`}
            >
              <span className="block text-sm font-bold">SDE</span>
              <span className="mt-1 block text-xs">Technical</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#13131c] p-4">
          <p className="text-xs font-semibold text-zinc-500">
            Login credentials that will be sent:
          </p>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            <p>
              Portal: <span className="font-mono text-white">iceconnect.in</span>
            </p>
            <p>
              Password: <span className="font-mono text-white">123456789</span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6b60e8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account + send email →"}
        </button>
      </form>
    </div>
  );
}
