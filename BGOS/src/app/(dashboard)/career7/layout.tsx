import { redirect } from "next/navigation";
import auth from "@/lib/auth";
import { Career7Sidebar, Career7Topbar, NexaGuide } from "@/components/career7";

export default async function Career7Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#f8f9fd] text-slate-950">
      <div className="hidden w-[292px] shrink-0 overflow-y-auto xl:block">
        <Career7Sidebar userName={session.user.name || "User"} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f9fd]">
        <Career7Topbar
          title={`Good Morning, ${session.user.name?.split(" ")[0] || "Arjun"}!`}
          subtitle="Let's build your dream career today."
          userName={session.user.name || "Arjun Verma"}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1560px] px-5 py-6 sm:px-8">{children}</div>
        </main>
      </div>

      <NexaGuide userName={session.user.name || "User"} />
    </div>
  );
}
