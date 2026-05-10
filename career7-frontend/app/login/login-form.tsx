"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getApiErrorMessage, sessionApi } from "@/lib/api";
import { TextField } from "../auth-shared";

function safeReturnTo(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const destination = safeReturnTo(searchParams.get("returnTo"));
      await sessionApi.login({ email, password }, destination);
      router.replace(destination);
      router.refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <TextField
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-700">
          Forgot password?
        </Link>
      </div>

      <button type="submit" disabled={loading} className="c7-button-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? "Signing in..." : "Continue to dashboard"}
      </button>
    </form>
  );
}
