import { LoginClient } from "@/components/auth/login-client";
import { getAuthBusinessModel } from "@/lib/auth-business-model";
import { isNiceJobsRequest } from "@/lib/nicejobs/domain";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { businessModel?: string; callbackUrl?: string };
}) {
  const businessModel = searchParams?.businessModel
    ? getAuthBusinessModel(searchParams.businessModel)
    : isNiceJobsRequest()
      ? "nicejobs"
      : "bgos";

  return (
    <LoginClient
      businessModel={businessModel}
      callbackUrl={searchParams?.callbackUrl}
    />
  );
}
