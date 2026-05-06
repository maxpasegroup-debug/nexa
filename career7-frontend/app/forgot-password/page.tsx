import Link from "next/link";

import { AuthShell, TextField } from "../auth-shared";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your email and we will show a placeholder recovery flow. Real email delivery will be connected later."
      sideTitle="Simple recovery for a premium career workspace."
      sideDescription="Keep access to your Growth Board, agents, credits, and NEXA context without adding friction."
      highlights={["Clean recovery flow", "No real email sent yet", "Dashboard route placeholder"]}
    >
      <form action="/login" className="mt-6 space-y-4">
        <TextField label="Email address" type="email" placeholder="you@example.com" />
        <button type="submit" className="c7-button-primary w-full">
          Send reset instructions
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm sm:flex-row sm:justify-center">
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Back to login
        </Link>
        <span className="hidden c7-muted sm:inline">·</span>
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
