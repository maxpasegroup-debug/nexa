"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Unable to send reset link. Please try again.");
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070709] px-4 py-10 font-sans">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#13131c] p-8 shadow-2xl shadow-black/30">
        <div className="text-center font-heading text-4xl font-bold tracking-normal">
          <span className="text-white">B</span>
          <span className="text-[#7C6FFF]">GOS</span>
        </div>
        <div className="mt-8 space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-normal text-white">
            Reset your password
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your email and we will send reset instructions.
          </p>
        </div>

        {success ? (
          <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            If this email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
          />
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-[#7C6FFF] hover:text-[#9a91ff]"
          >
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
