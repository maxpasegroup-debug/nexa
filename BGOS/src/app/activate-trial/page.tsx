import { ActivateTrialClient } from "@/components/trial/activate-trial-client";

export default function ActivateTrialPage({
  searchParams,
}: {
  searchParams: { businessId?: string; token?: string };
}) {
  return (
    <ActivateTrialClient
      businessId={searchParams.businessId}
      token={searchParams.token}
    />
  );
}
