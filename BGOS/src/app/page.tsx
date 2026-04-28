import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDomainType, getRedirectForRole } from "@/lib/domain";
import LandingPage from "@/components/landing/landing-page";
import EmployeeLandingPage from "@/components/employee/employee-landing-page";

export default async function Home() {
  const session = await auth();
  const headersList = headers();
  const host = headersList.get("host") || "";
  const domainType = getDomainType(host);

  if (session?.user) {
    redirect(getRedirectForRole(session.user.role as string));
  }

  if (domainType === "employee") {
    return <EmployeeLandingPage />;
  }

  return <LandingPage />;
}
