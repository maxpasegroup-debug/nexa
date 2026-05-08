import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure login"
      title="Welcome back to Blizzway"
      description="Use this placeholder login to enter the dashboard preview. Real authentication will be connected later."
      sideTitle="Return to your magical career pathway."
      sideDescription="NEXA keeps your pathway calm, focused, and ready for the next meaningful action."
      highlights={[
        "Premium Blizzway workspace",
        "NEXA Guardian Angel AI guidance",
        "My Pathway, Soul Vault, and Magic Market in one place",
      ]}
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
        New to Blizzway?{" "}
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Begin your pathway
        </Link>
      </p>
    </AuthShell>
  );
}
