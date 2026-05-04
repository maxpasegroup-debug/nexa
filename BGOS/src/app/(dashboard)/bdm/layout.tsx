import { redirect } from "next/navigation";
import type { CSSProperties } from "react";

import auth from "@/lib/auth";
import { getRoleRedirect } from "@/lib/role-redirect";

export default async function BdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role ?? "EMPLOYEE";

  if (role !== "BDM" && role !== "OWNER") {
    redirect(getRoleRedirect(role));
  }

  const bdmSubType = session.user.bdmSubType === "MF" ? "MF" : "BDM";
  const accent = bdmSubType === "MF" ? "#F59E0B" : "#7C6FFF";
  const accentMuted =
    bdmSubType === "MF" ? "rgba(245,158,11,0.15)" : "rgba(124,111,255,0.15)";
  const accentBorder =
    bdmSubType === "MF" ? "rgba(245,158,11,0.3)" : "rgba(124,111,255,0.3)";

  return (
    <div
      data-subtype={bdmSubType}
      data-bdm-code={session.user.bdmCode ?? ""}
      style={
        {
          "--accent": accent,
          "--accent-muted": accentMuted,
          "--accent-border": accentBorder,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
