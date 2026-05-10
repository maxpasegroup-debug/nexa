"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getApiErrorMessage, sessionApi } from "@/lib/api";
import { TextField } from "../auth-shared";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sessionApi.signup({ name, email, password });
      router.replace("/onboarding");
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
        label="Full name"
        placeholder="Your name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
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
        placeholder="Create a password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
      />

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm font-black text-indigo-700">NEXA onboarding preview</p>
        <p className="mt-1 text-sm leading-6 text-indigo-700/75">
          After signup, NEXA will ask about your current stage, dream goal, and long-term vision.
        </p>
      </div>

      <button type="submit" disabled={loading} className="c7-button-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? "Creating pathway..." : "Begin My Pathway"}
      </button>
    </form>
  );
}
