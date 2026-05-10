import Link from "next/link";

import { AuthShell } from "../auth-shared";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Secure login"
      title="Welcome back to Blizzway"
      description="Sign in with your BGOS-powered Blizzway workspace account."
      sideTitle="Return to your magical career pathway."
      sideDescription="NEXA keeps your pathway calm, focused, and ready for the next meaningful action."
      highlights={[
        "Premium Blizzway workspace",
        "NEXA Guardian Angel AI guidance",
        "My Pathway, Soul Vault, and Magic Market in one place",
      ]}
    >
      <LoginForm />

      <p className="mt-6 text-center text-sm c7-muted">
        New to Blizzway?{" "}
        <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
          Begin your pathway
        </Link>
      </p>
    </AuthShell>
  );
}
