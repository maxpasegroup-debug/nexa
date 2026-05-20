import Link from "next/link";
import { BriefcaseBusiness, ChartNoAxesCombined, FileSignature, GraduationCap, WalletCards } from "lucide-react";

const navItems = [
  { href: "/nicejobs/dashboard", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/nicejobs/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/nicejobs/applications", label: "Applications", icon: FileSignature },
  { href: "/nicejobs/training", label: "Training", icon: GraduationCap },
  { href: "/nicejobs/earnings", label: "Earnings", icon: WalletCards },
  { href: "/nicejobs/payouts", label: "Payouts", icon: WalletCards },
];

export function NiceJobsAppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#151515]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#151515]/10 bg-[#151515] text-white lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <Link href="/nicejobs/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0c85a] text-sm font-black text-[#151515]">
              NJ
            </span>
            <div>
              <p className="text-lg font-black leading-tight">NICEJOBS</p>
              <p className="text-xs font-semibold text-white/55">BGOS-powered</p>
            </div>
          </Link>

          <nav className="mt-10 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon size={18} /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-white/55">Signed in as</p>
            <p className="mt-1 text-sm font-black">{userName}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#151515]/10 bg-[#f7f7f2]/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/nicejobs/dashboard" className="flex items-center gap-3 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#151515] text-xs font-black text-white">
                NJ
              </span>
              <span className="font-black">NICEJOBS</span>
            </Link>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-[#555]">Micro-franchise workspace</p>
              <h1 className="text-xl font-black">Welcome back, {userName.split(" ")[0] || "Partner"}</h1>
            </div>
            <Link
              href="/nicejobs/opportunities"
              className="rounded-md bg-[#1c7c54] px-4 py-2 text-sm font-black text-white transition hover:bg-[#166843]"
            >
              Browse
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
