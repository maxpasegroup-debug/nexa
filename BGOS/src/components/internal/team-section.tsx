"use client";

import { useEffect, useMemo, useState } from "react";

import { AddEmployeeForm } from "@/components/internal/add-employee-form";
import { EmployeeCard, type InternalEmployee } from "@/components/internal/employee-card";
import { EmployeeEditDrawer } from "@/components/internal/employee-edit-drawer";

const filters = ["All", "BDM", "SDE", "Active", "Archived"];

export function TeamSection({
  onEmployeeClick,
}: {
  onEmployeeClick?: (employee: InternalEmployee) => void;
}) {
  const [employees, setEmployees] = useState<InternalEmployee[]>([]);
  const [filter, setFilter] = useState("All");
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
        if (filter === "BDM" || filter === "SDE") return employee.role === filter;
        if (filter === "Active") return employee.status === "ACTIVE" && employee.active;
        if (filter === "Archived") return employee.status === "ARCHIVED" || !employee.active;
        return true;
      }),
    [employees, filter],
  );

  function edit(employee: InternalEmployee) {
    onEmployeeClick?.(employee);
    setSelected(employee);
  }

  return (
    <section className="rounded-[14px] border border-white/10 bg-[#13131c] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">My team</h2>
          <p className="mt-1 text-sm text-zinc-500">{employees.length} employees</p>
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
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} onEdit={edit} onRefresh={() => void load()} />
        ))}
      </div>
      <EmployeeEditDrawer employee={selected} isOpen={Boolean(selected)} onClose={() => setSelected(null)} onSave={() => { setSelected(null); void load(); }} />
    </section>
  );
}
