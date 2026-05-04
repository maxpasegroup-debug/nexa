import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRoleRedirect } from "@/lib/role-redirect";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect(getRoleRedirect(session.user.role as string));
  }

  return <LandingPage />;
}
