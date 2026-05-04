"use client";

import { useEffect, useMemo, useState } from "react";

import { AddEmployeeForm } from "@/components/internal/add-employee-form";
import { EmployeeCard, type InternalEmployee } from "@/components/internal/employee-card";
import { EmployeeEditDrawer } from "@/components/internal/employee-edit-drawer";

const filters = ["All", "BDM", "SDE", "Active", "Archived", "Deletion bin"];
const bdmTabs = [
  { id: "BDM", label: "BDM" },
  { id: "MF", label: "Micro Franchise" },
] as const;

export function TeamSection({
  onEmployeeClick,
}: {
  onEmployeeClick?: (employee: InternalEmployee) => void;
}) {
  const [employees, setEmployees] = useState<InternalEmployee[]>([]);
  const [filter, setFilter] = useState("All");
  const [bdmTab, setBdmTab] = useState<"BDM" | "MF">("BDM");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<InternalEmployee | null>(null);

  async function load() {
    const response = await fetch("/api/internal/employees", { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { employees?: InternalEmployee[] };
    setEmployees(data.employees ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () =>
      employees.filter((employee) => {
        if (filter === "BDM") {
          return employee.role === "BDM" && (bdmTab === "MF" ? employee.bdmSubType === "MF" : employee.bdmSubType !== "MF");
        }
        if (filter === "SDE") return employee.role === filter;
        if (filter === "Deletion bin") return employee.status === "DELETED" || Boolean(employee.deletedAt);
        if (filter === "Active") return employee.status === "ACTIVE" && employee.active;
        if (filter === "Archived") return (employee.status === "ARCHIVED" || !employee.active) && employee.status !== "DELETED";
        return true;
      }),
    [employees, filter, bdmTab],
  );

  const bdmCount = employees.filter((employee) => employee.role === "BDM" && employee.bdmSubType !== "MF").length;
  const mfCount = employees.filter((employee) => employee.role === "BDM" && employee.bdmSubType === "MF").length;

  function edit(employee: InternalEmployee) {
    onEmployeeClick?.(employee);
    setSelected(employee);
  }

  return (
    <section className="rounded-[14px] border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">Manage my team</h2>
          <p className="mt-1 text-sm text-zinc-500">{employees.filter((item) => item.status !== "DELETED").length} employees · {employees.filter((item) => item.status === "ARCHIVED").length} archived</p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white">
          Add employee +
        </button>
      </div>
      {showForm ? (
        <div className="mt-4">
          <AddEmployeeForm onSuccess={() => { setShowForm(false); void load(); }} onClose={() => setShowForm(false)} />
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1 text-xs font-bold ${filter === item ? "bg-[#22D9A0] text-black" : "bg-white/10 text-zinc-400"}`}>
            {item}
          </button>
        ))}
      </div>
      {filter === "BDM" ? (
        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
          {bdmTabs.map((tab) => {
            const count = tab.id === "MF" ? mfCount : bdmCount;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBdmTab(tab.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  bdmTab === tab.id
                    ? tab.id === "MF"
                      ? "bg-[#F59E0B] text-black"
                      : "bg-[#7C6FFF] text-white"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} onEdit={edit} onRefresh={() => void load()} />
        ))}
      </div>
      <EmployeeEditDrawer employee={selected} isOpen={Boolean(selected)} onClose={() => setSelected(null)} onSave={() => { setSelected(null); void load(); }} />
    </section>
  );
}
