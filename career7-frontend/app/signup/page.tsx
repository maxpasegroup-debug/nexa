import Link from "next/link";

import { AuthShell } from "../auth-shared";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Begin with NEXA"
      title="Create your Blizzway pathway"
      description="Create a BGOS-powered Blizzway workspace and begin your pathway."
      sideTitle="Meet NEXA before your first career move."
      sideDescription="NEXA is the Guardian Angel AI who learns your dream, understands your stage, and helps shape your magical career pathway."
      highlights={[
        "Personal pathway preview",
        "Learning Garden and Earning Universe guidance",
        "Soul Vault for confidence, proof, and reflection",
      ]}
    >
      <SignupForm />

      <p className="mt-6 text-center text-sm c7-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
