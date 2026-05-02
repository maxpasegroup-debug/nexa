import { redirect } from "next/navigation";

import { MobileSDEMore } from "@/components/sde/mobile/mobile-sde-more";
import auth from "@/lib/auth";

export default async function SdeMorePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <MobileSDEMore />;
}
