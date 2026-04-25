"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Logo() {
  return (
    <div className="text-center font-heading text-4xl font-bold tracking-normal">
      <span className="text-white">B</span>
      <span className="text-[#7C6FFF]">GOS</span>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const success = searchParams.get("success");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl || "/boss");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070709] px-4 py-10 font-sans">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#13131c] p-8 shadow-2xl shadow-black/30">
        <Logo />
        <div className="mt-8 space-y-2 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-normal text-white">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in to continue to your operating system.
          </p>
        </div>

        {success ? (
          <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Your password was reset successfully. Please sign in.
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#7C6FFF] hover:text-[#9a91ff]"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New to BGOS?{" "}
          <Link
            href="/register"
            className="font-medium text-[#7C6FFF] hover:text-[#9a91ff]"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
