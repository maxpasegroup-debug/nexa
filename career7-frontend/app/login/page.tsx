import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure login"
      title="Welcome back"
      description="Enter your Career7 workspace. This is a branded placeholder until real authentication is connected."
      sideTitle="Return to your AI career command center."
      sideDescription="Review your Growth Board, spend credits wisely, and let NEXA keep your next move visible."
      highlights={["Protected career workspace", "NEXA-ready growth context", "Credits and agents in one place"]}
    >
      <form action="/dashboard" className="mt-6 space-y-4">
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

        <button type="submit" className="c7-button-primary w-full">
          Continue to dashboard
        </button>
      </form>

      <p className="mt-6 text-center text-sm c7-muted">
        New to Career7?{" "}
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
