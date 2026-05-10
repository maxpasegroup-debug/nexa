"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { career7Api } from "@/lib/api";

type AuthState = "checking" | "allowed" | "blocked";

function loginHref(returnTo: string) {
  const url = new URL("/login", window.location.origin);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

export function Career7AuthBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyCareer7Session() {
      try {
        await career7Api.getHealth();
        if (!cancelled) setAuthState("allowed");
      } catch {
        if (cancelled) return;
        setAuthState("blocked");
        const query = searchParams.toString();
        window.location.assign(loginHref(`${pathname}${query ? `?${query}` : ""}`));
      }
    }

    void verifyCareer7Session();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  if (authState === "allowed") {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-6 text-slate-950">
      <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-950/8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
          Blizzway secure session
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">
          {authState === "checking" ? "Checking your session" : "Sign in required"}
        </h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Blizzway pages require an active BGOS Blizzway workspace session.
        </p>
        {authState === "blocked" ? (
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Continue to login
          </Link>
        ) : null}
      </section>
    </main>
  );
}
