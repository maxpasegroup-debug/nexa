import { headers } from "next/headers";

export const NICEJOBS_DOMAIN =
  process.env.NEXT_PUBLIC_NICEJOBS_DOMAIN || "nicejobs.online";

export function isNiceJobsHost(host?: string | null) {
  if (!host) return false;

  const normalizedHost = host.split(":")[0]?.toLowerCase() || "";
  const normalizedDomain = NICEJOBS_DOMAIN.toLowerCase();

  return (
    normalizedHost === normalizedDomain ||
    normalizedHost === `www.${normalizedDomain}` ||
    normalizedHost.includes("nicejobs")
  );
}

export function isNiceJobsRequest() {
  return isNiceJobsHost(headers().get("host"));
}
