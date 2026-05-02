"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone } from "lucide-react";

import {
  BdmBriefForm,
  type OnboardingLeadForBDM,
} from "@/components/bdm/bdm-brief-form";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/toast";

function timeAgo(value: string | Date) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function submittedLabel(value: string | Date | null) {
  if (!value) return "Not submitted";
  return `Submitted ${timeAgo(value)}`;
}

export function OnboardingLeads({ currentUserId }: { currentUserId: string }) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<OnboardingLeadForBDM[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<OnboardingLeadForBDM | null>(null);

  async function loadLeads() {
    setLoading(true);
    const response = await fetch("/api/bdm/onboarding-leads", {
      cache: "no-store",
    });
    setLoading(false);
    if (!response.ok) {
      toast("Could not load onboarding leads", "error");
      return;
    }
    const data = (await response.json()) as { leads: OnboardingLeadForBDM[] };
    setLeads(
      data.leads.filter((lead) => lead.assignedBDMId === currentUserId),
    );
  }

  useEffect(() => {
    void loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const needsCall = useMemo(
    () =>
      leads.filter((lead) =>
        ["BDM_ASSIGNED", "BDM_CONTACTED"].includes(lead.status),
      ),
    [leads],
  );
  const submitted = useMemo(
    () =>
      leads.filter(
        (lead) => !["BDM_ASSIGNED", "BDM_CONTACTED"].includes(lead.status),
      ),
    [leads],
  );

  async function markContacted(lead: OnboardingLeadForBDM) {
    const response = await fetch("/api/bdm/onboarding-leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboardingLeadId: lead.id,
        status: "BDM_CONTACTED",
      }),
    });

    if (!response.ok) {
      toast("Could not update lead", "error");
      return;
    }

    const data = (await response.json()) as { lead: OnboardingLeadForBDM };
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? data.lead : item)),
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold">Needs your call</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Call new prospects, collect details, and submit the workspace brief.
            </p>
          </div>
          <span className="rounded-full bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]">
            {needsCall.length}
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6 text-sm text-zinc-500">
            Loading onboarding leads...
          </div>
        ) : needsCall.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {needsCall.map((lead) => (
              <article
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-[#13131c] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">
                      {lead.companyName}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Assigned {timeAgo(lead.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#F5A623]/30 bg-[#F5A623]/10 px-2 py-1 text-[10px] font-bold text-[#F5A623]">
                    {lead.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-zinc-400">
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-2 font-bold text-[#22D9A0]"
                  >
                    <Phone className="h-4 w-4" />
                    {lead.phone}
                  </a>
                  <p>{lead.businessType}</p>
                  <p>{lead.employeeCount} employees</p>
                  {lead.challenge ? <p className="text-zinc-500">{lead.challenge}</p> : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void markContacted(lead)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white"
                  >
                    Mark as contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className="rounded-xl bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black"
                  >
                    I have all details - submit brief
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No onboarding calls pending"
            description="New landing page leads assigned to you will appear here."
          />
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold">Submitted</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Briefs already sent to SDE or later in the onboarding flow.
          </p>
        </div>
        {submitted.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#13131c]">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Company</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>SDE</th>
                </tr>
              </thead>
              <tbody>
                {submitted.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5">
                    <td className="px-4 py-4 font-semibold text-white">
                      {lead.companyName}
                    </td>
                    <td className="text-zinc-400">{lead.status}</td>
                    <td className="text-zinc-500">{submittedLabel(lead.bdmSubmittedAt)}</td>
                    <td className="text-zinc-400">
                      {lead.assignedSDE?.name ?? "Not assigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No submitted briefs"
            description="Once you submit a workspace brief, it will move here."
          />
        )}
      </section>

      {selectedLead ? (
        <BdmBriefForm
          lead={selectedLead}
          onSuccess={() => void loadLeads()}
          onClose={() => setSelectedLead(null)}
        />
      ) : null}
    </div>
  );
}
