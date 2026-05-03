"use client";

import { TeamSection } from "@/components/internal/team-section";
import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";
import type { InternalEmployee } from "@/components/internal/employee-card";

type InternalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type TeamManagementPageProps = {
  user: InternalUser;
  employees: InternalEmployee[];
};

export function TeamManagementPage({
  user,
  employees,
}: TeamManagementPageProps) {
  void employees;
  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={user} />
      <InternalTopbar user={user} />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">BGOS Team</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Edit, manage, archive, and delete employees from one control panel.
              </p>
            </div>
          </section>

          <TeamSection />
        </div>
      </main>
    </div>
  );
}
