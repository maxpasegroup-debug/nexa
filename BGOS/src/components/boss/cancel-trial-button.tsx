"use client";

import { useState } from "react";

const reasons = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features" },
  { value: "not_the_right_time", label: "Not the right time" },
  { value: "found_another_tool", label: "Found another tool" },
  { value: "other", label: "Other" },
];

export function CancelTrialButton({
  trialEndsAt,
  amount,
}: {
  trialEndsAt: string;
  amount: number;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("not_the_right_time");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);

  async function cancelTrial() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/trial/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to cancel trial.");
      return;
    }

    setCancelled(true);
    setOpen(false);
  }

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
        Trial cancelled. Your team access has been disabled and your data is saved for 30 days.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-amber-100">Free trial</h3>
          <p className="mt-1 text-sm text-amber-100/75">
            Trial ends on {new Date(trialEndsAt).toLocaleDateString("en-IN")}. You will be charged ₹
            {amount.toLocaleString("en-IN")} unless you cancel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-red-400/40 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/10"
        >
          Cancel trial
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#13131c] p-6 text-white shadow-2xl">
            <h2 className="font-heading text-xl font-bold">Are you sure?</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Your team will lose access immediately. Your data is saved for 30 days.
            </p>
            <div className="mt-5">
              <p className="text-sm font-semibold text-zinc-300">What was the main reason for cancelling?</p>
              <div className="mt-3 space-y-2">
                {reasons.map((item) => (
                  <label key={item.value} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300">
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      className="accent-red-400"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300"
              >
                Keep trial
              </button>
              <button
                type="button"
                onClick={() => void cancelTrial()}
                disabled={loading}
                className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading ? "Cancelling..." : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
