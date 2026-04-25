import { redirect } from "next/navigation";

import { InboxPage } from "@/components/inbox/inbox-page";
import { NexaPanel } from "@/components/boss/nexa-panel";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BossInboxPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) {
    redirect("/onboarding");
  }

  if (user.role !== "BOSS" && user.role !== "ADMIN") {
    redirect(`/${user.role.toLowerCase()}`);
  }

  const emailAccount = await prisma.emailAccount.findFirst({
    where: { businessId: user.business.id, isActive: true },
    select: { id: true },
  });

  const isConnected = Boolean(emailAccount);

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <Sidebar
        role={user.role}
        userName={user.name}
        businessName={user.business.name}
      />
      <Navbar title="Inbox" userName={user.name} role={user.role} />

      <main className="pt-[60px]">
        <InboxPage
          isConnected={isConnected}
          businessId={user.business.id}
        />
      </main>

      <NexaPanel businessId={user.business.id} />
    </div>
  );
}
