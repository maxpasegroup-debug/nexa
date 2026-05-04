"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    const theme = session?.user?.theme || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, [session]);

  return <>{children}</>;
}
