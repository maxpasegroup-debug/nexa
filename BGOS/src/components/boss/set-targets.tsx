"use client";

import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/ui/toast";

type TargetBdm = {
  id: string;
  name: string;
  role: string;
  leadsTarget: number;
  wonTarget: number;
  revenueTarget: number;
};

type TargetForm = {
  leadsTarget: string;
  wonTarget: string;
  revenueTarget: string;
};

function monthLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function SetTargets() {
  const { toast } = useToast();
  const [bdms, setBdms] = useState<TargetBdm[]>([]);
  const [forms, setForms] = useState<Record<string, TargetForm>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const label = useMemo(() => monthLabel(), []);

  useEffect(() => {
    async function loadBdms() {
      const response = await fetch("/api/boss/team-performance", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = (await response.json()) as { bdms: TargetBdm[] };
      setBdms(data.bdms);
      setForms(
        data.bdms.reduce<Record<string, TargetForm>>((acc, bdm) => {
          acc[bdm.id] = {
            leadsTarget: String(bdm.leadsTarget ?? 0),
            wonTarget: String(bdm.wonTarget ?? 0),
            revenueTarget: String(bdm.revenueTarget ?? 0),
          };
          return acc;
        }, {}),
      );
    }

    void loadBdms();
  }, []);

  async function saveTarget(userId: string) {
    const form = forms[userId];
    if (!form) return;

    setSavingId(userId);
    const response = await fetch("/api/bdm/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        leadsTarget: Number(form.leadsTarget || 0),
        wonTarget: Number(form.wonTarget || 0),
        revenueTarget: Number(form.revenueTarget || 0),
      }),
    });
    setSavingId(null);

    if (!response.ok) {
      toast("Could not save targets", "error");
      return;
    }

    toast("Targets saved", "success");
  }

  function updateForm(userId: string, key: keyof TargetForm, value: string) {
    setForms((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [key]: value,
      },
    }));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <h2 className="font-heading text-base font-bold text-white">
        Targets for {label}
      </h2>
      <div className="mt-5 space-y-3">
        {bdms.length > 0 ? (
          bdms.map((bdm) => {
            const form = forms[bdm.id] ?? {
              leadsTarget: "0",
              wonTarget: "0",
              revenueTarget: "0",
            };

            return (
              <div
                key={bdm.id}
                className="grid gap-3 rounded-xl border border-white/10 bg-[#0e0e13] p-4 lg:grid-cols-[1fr_repeat(3,140px)_120px] lg:items-end"
              >
                <div>
                  <p className="text-sm font-bold text-white">{bdm.name}</p>
                  <span className="mt-1 inline-flex rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#b8b2ff]">
                    {bdm.role}
                  </span>
                </div>
                {[
                  ["leadsTarget", "Leads target"],
                  ["wonTarget", "Deals won"],
                  ["revenueTarget", "Revenue"],
                ].map(([key, labelText]) => (
                  <label key={key} className="block">
                    <span className="text-[11px] font-semibold text-zinc-500">
                      {labelText}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form[key as keyof TargetForm]}
                      onChange={(event) =>
                        updateForm(
                          bdm.id,
                          key as keyof TargetForm,
                          event.target.value,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#070709] px-3 py-2 text-sm text-white outline-none focus:border-[#7C6FFF]"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => void saveTarget(bdm.id)}
                  disabled={savingId === bdm.id}
                  className="rounded-lg bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6b60e8] disabled:opacity-60"
                >
                  {savingId === bdm.id ? "Saving..." : "Save targets"}
                </button>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
            Invite BDMs first, then set their monthly targets here.
          </p>
        )}
      </div>
    </section>
  );
}
