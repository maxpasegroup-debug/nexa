import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getRoleRedirect } from "@/lib/role-redirect";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "EMPLOYEE") {
    redirect(getRoleRedirect(session.user.role as string));
  }

  return (
    <div data-theme="light" style={{ background: "#FAFAFA", minHeight: "100vh", color: "#1A1A2E" }}>
      <main style={{ paddingBottom: "72px" }}>{children}</main>
    </div>
  );
}
