import { RegisterClient } from "@/components/auth/register-client";
import { getAuthBusinessModel } from "@/lib/auth-business-model";

export default function BgosRegisterPage({
  searchParams,
}: {
  searchParams?: { businessModel?: string };
}) {
  return <RegisterClient businessModel={getAuthBusinessModel(searchParams?.businessModel)} />;
}

