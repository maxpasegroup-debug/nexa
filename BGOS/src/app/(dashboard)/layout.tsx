"use client";

import { useSession } from "next-auth/react";

import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";
import { TabletSidebar } from "@/components/tablet/tablet-sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useDevice } from "@/hooks/use-device";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const device = useDevice();
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (device === "mobile") {
    return (
      <div className="mobile-page min-h-screen bg-[#070709] font-sans text-white">
        <ErrorBoundary>{children}</ErrorBoundary>
        <MobileBottomNav role={role} />
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div className="min-h-screen bg-[#070709] font-sans text-white">
        <TabletSidebar role={role} />
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] font-sans text-white">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
