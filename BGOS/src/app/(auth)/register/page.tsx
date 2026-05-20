import { RegisterClient } from "@/components/auth/register-client";
import { getAuthBusinessModel } from "@/lib/auth-business-model";
import { isNiceJobsRequest } from "@/lib/nicejobs/domain";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { businessModel?: string };
}) {
  const businessModel = searchParams?.businessModel
    ? getAuthBusinessModel(searchParams.businessModel)
    : isNiceJobsRequest()
      ? "nicejobs"
      : "bgos";

  return <RegisterClient businessModel={businessModel} />;
}
