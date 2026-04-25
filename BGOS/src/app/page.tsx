import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;

    if (role === "BOSS") redirect("/boss");
    if (role === "BDM") redirect("/bdm");
    if (role === "SDE") redirect("/sde");
  }

  return <LandingPage />;
}
