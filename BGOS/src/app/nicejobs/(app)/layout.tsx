import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { NiceJobsAppShell } from "@/components/nicejobs/nicejobs-app-shell";

export default async function NiceJobsDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?businessModel=nicejobs&callbackUrl=/nicejobs/dashboard");
  }

  return (
    <NiceJobsAppShell userName={session.user.name || "Partner"}>
      {children}
    </NiceJobsAppShell>
  );
}
