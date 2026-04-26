"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { AddEmployeeForm } from "@/components/internal/add-employee-form";
import {
  EmployeeList,
  type EmployeeListItem,
} from "@/components/internal/employee-list";
import {
  InternalSidebar,
  InternalTopbar,
} from "@/components/internal/bgos-internal-dashboard";

type InternalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type TeamManagementPageProps = {
  user: InternalUser;
  employees: EmployeeListItem[];
};

export function TeamManagementPage({
  user,
  employees: initialEmployees,
}: TeamManagementPageProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [showForm, setShowForm] = useState(false);

  async function refreshEmployees() {
    const response = await fetch("/api/internal/employees", {
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = (await response.json()) as { employees: EmployeeListItem[] };
    setEmployees(data.employees);
  }

  const bdms = employees.filter((employee) => employee.role === "BDM");
  const sdes = employees.filter((employee) => employee.role === "SDE");

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
                Manage your BDMs and SDEs
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6b60e8]"
            >
              <UserPlus className="h-4 w-4" />
              Add employee +
            </button>
          </section>

          <div
            className={`grid transition-all duration-300 ${
              showForm ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <AddEmployeeForm
                onSuccess={() => void refreshEmployees()}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-[#7C6FFF]/20 bg-[#13131c] p-6">
              <h2 className="font-heading text-lg font-bold text-[#c6c1ff]">
                Sales team ({bdms.length})
              </h2>
              <div className="mt-5">
                <EmployeeList
                  employees={bdms}
                  onResetPassword={() => void refreshEmployees()}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-[#22D9A0]/20 bg-[#13131c] p-6">
              <h2 className="font-heading text-lg font-bold text-[#22D9A0]">
                Technical team ({sdes.length})
              </h2>
              <div className="mt-5">
                <EmployeeList
                  employees={sdes}
                  onResetPassword={() => void refreshEmployees()}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
