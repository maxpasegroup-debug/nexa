"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: { businessModel?: string };
}) {
  const isNiceJobs = searchParams?.businessModel === "nicejobs";
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
    <main className={`flex min-h-screen items-center justify-center px-4 py-10 font-sans ${isNiceJobs ? "bg-[#f7f7f2]" : "bg-[#070709]"}`}>
      <section className={`w-full max-w-md rounded-lg border p-8 shadow-2xl ${isNiceJobs ? "border-[#151515]/10 bg-white shadow-slate-200/60" : "border-white/10 bg-[#13131c] shadow-black/30"}`}>
        <div className="text-center font-heading text-4xl font-bold tracking-normal">
          {isNiceJobs ? (
            <>
              <span className="text-[#151515]">NICE</span>
              <span className="text-[#1c7c54]">JOBS</span>
            </>
          ) : (
            <>
              <span className="text-white">B</span>
              <span className="text-[#7C6FFF]">GOS</span>
            </>
          )}
        </div>
        <div className="mt-8 space-y-2 text-center">
          <h1 className={`font-heading text-2xl font-bold tracking-normal ${isNiceJobs ? "text-[#151515]" : "text-white"}`}>
            Reset your password
          </h1>
          <p className={isNiceJobs ? "text-sm text-[#555]" : "text-sm text-zinc-400"}>
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
          <Button type="submit" fullWidth loading={loading} className={isNiceJobs ? "bg-[#1c7c54] hover:bg-[#166843]" : undefined}>
            Send reset link
          </Button>
        </form>

        <p className={isNiceJobs ? "mt-6 text-center text-sm text-[#555]" : "mt-6 text-center text-sm text-zinc-400"}>
          Remember your password?{" "}
          <Link
            href={isNiceJobs ? "/login?businessModel=nicejobs" : "/login"}
            className={isNiceJobs ? "font-bold text-[#1c7c54]" : "font-medium text-[#7C6FFF] hover:text-[#9a91ff]"}
          >
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
