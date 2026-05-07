import { LoginClient } from "@/components/auth/login-client";
import { getAuthBusinessModel } from "@/lib/auth-business-model";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { businessModel?: string; callbackUrl?: string };
}) {
  return (
    <LoginClient
      businessModel={getAuthBusinessModel(searchParams?.businessModel)}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
