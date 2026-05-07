import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";

import { AuthShell, TextField } from "../auth-shared";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const callbackUrl = returnTo?.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/career7/dashboard";
  const loginUrl = new URL("/login", getApiBaseUrl());
  loginUrl.searchParams.set("businessModel", "career7");
  loginUrl.searchParams.set("callbackUrl", callbackUrl);

  return (
    <AuthShell
      eyebrow="Secure login"
      title="Welcome back"
      description="Enter your Career7 workspace through BGOS authentication."
      sideTitle="Return to your AI career command center."
      sideDescription="Review your Growth Board, spend credits wisely, and let NEXA keep your next move visible."
      highlights={["Protected career workspace", "NEXA-ready growth context", "Credits and agents in one place"]}
    >
      <div className="mt-6 space-y-4">
        <TextField label="Email address" type="email" placeholder="you@example.com" />
        <TextField label="Password" type="password" placeholder="Enter your password" />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-semibold text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-700">
            Forgot password?
          </Link>
        </div>

        <Link href={loginUrl.toString()} className="c7-button-primary block w-full text-center">
          Continue to dashboard
        </Link>
      </div>

      <p className="mt-6 text-center text-sm c7-muted">
        New to Career7?{" "}
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
