"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRedirectForRole, isBossRole, isEmployeeRole } from "@/lib/domain";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as string | undefined;

    if (role && isBossRole(role)) {
      await signOut({ redirect: false });
      setLoading(false);
      setError(
        "This portal is for employees only. Please visit bgos.online to log in.",
      );
      return;
    }

    if (role && isEmployeeRole(role)) {
      router.push(getRedirectForRole(role));
      router.refresh();
      return;
    }

    setLoading(false);
    setError("Unable to verify your employee access. Please try again.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070709] px-4 py-10 font-sans text-white">
      <section className="w-full max-w-[400px] rounded-xl border border-white/10 bg-[#13131c] p-8 shadow-2xl shadow-black/30">
        <div className="text-center">
          <div className="font-heading text-2xl font-bold tracking-normal">
            <span className="text-white">ice</span>
            <span className="text-[#22D9A0]">connect</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Employee workspace</p>
        </div>

        <p className="mt-7 text-center text-[13px] leading-5 text-zinc-400">
          Welcome back. Log in to access your dashboard.
        </p>

        {error ? (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
            {error}
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
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-4 text-sm">
          <Link
            href="/forgot-password"
            className="text-zinc-400 transition hover:text-white"
          >
            Forgot your password?
          </Link>
          <a
            href="mailto:hello@iceconnect.in"
            className="text-zinc-400 transition hover:text-white"
          >
            Need help?
          </a>
        </div>

        <a
          href="https://bgos.online"
          target="_blank"
          rel="noreferrer"
          className="mt-8 block text-center text-[11px] text-zinc-600 transition hover:text-zinc-300"
        >
          Powered by BGOS
        </a>
      </section>
    </main>
  );
}
