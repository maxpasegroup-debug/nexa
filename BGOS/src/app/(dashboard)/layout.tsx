import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#070709] font-sans text-white">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
