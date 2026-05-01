"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Edit,
  GripVertical,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { InternalSidebar, InternalTopbar } from "@/components/internal/bgos-internal-dashboard";
import { useToast } from "@/components/ui/toast";
import type { AgentOfferView, MarketplaceAgentView } from "@/components/marketplace/types";
import { categoryLabel, featuresFor, money } from "@/components/marketplace/marketplace-utils";

export type InternalMarketplaceInstallation = {
  id: string;
  agentId: string;
  businessId: string;
  status: string;
  onboardingFeePaid: boolean;
  monthlyFeePaid: boolean;
  installedAt: string | null;
  activeFrom: string | null;
  createdAt: string;
  agent: Pick<MarketplaceAgentView, "id" | "name" | "slug" | "icon" | "monthlyFee" | "onboardingFee">;
  business: { id: string; name: string; type: string };
  sdeAssignee: { id: string; name: string; email: string } | null;
};

type InternalCustomer = {
  id: string;
  name: string;
  plan: string;
  industry: string;
  agentCount: number;
};

type InternalSde = {
  id: string;
  name: string;
  email: string;
};

type MarketplaceRevenue = {
  totalInstallationsThisMonth: number;
  totalOnboardingFeeRevenue: number;
  totalMonthlyMRR: number;
  mostPopularAgent: string;
  averageAgentsPerCustomer: number;
  setupFeeRevenueThisMonth: number;
};

type InternalMarketplacePageProps = {
  user: { id: string; name: string; email: string; role: string };
  agents: MarketplaceAgentView[];
  installations: InternalMarketplaceInstallation[];
  offers: AgentOfferView[];
  sdes: InternalSde[];
  customers: InternalCustomer[];
  revenue: MarketplaceRevenue;
};

type BenefitRow = { icon: string; title: string; desc: string };
type StepRow = { step: string; icon: string; title: string; desc: string };

type AgentFormState = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  colorPrimary: string;
  colorSecondary: string;
  gradient: string;
  onboardingFee: number;
  monthlyFee: number;
  features: string[];
  benefits: BenefitRow[];
  howItWorks: StepRow[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

const emptyAgentForm: AgentFormState = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  category: "UNIVERSAL",
  icon: "⚡",
  colorPrimary: "#7C6FFF",
  colorSecondary: "#22D9A0",
  gradient: "linear-gradient(135deg,#0d0820,#050d15)",
  onboardingFee: 3999,
  monthlyFee: 999,
  features: [],
  benefits: [],
  howItWorks: [],
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dateLabel(value?: string | null) {
  if (!value) return "Not installed";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "PENDING") return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (status === "PAYMENT_DONE") return "border-blue-400/30 bg-blue-400/10 text-blue-200";
  if (status === "SDE_BUILDING") return "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#c8c2ff]";
  if (status === "ACTIVE") return "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]";
  if (status === "CANCELLED") return "border-red-400/30 bg-red-400/10 text-red-200";
  return "border-white/10 bg-white/5 text-zinc-300";
}

function agentToForm(agent: MarketplaceAgentView): AgentFormState {
  return {
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    tagline: agent.tagline,
    description: agent.description,
    category: agent.category,
    icon: agent.icon,
    colorPrimary: agent.colorPrimary,
    colorSecondary: agent.colorSecondary,
    gradient: agent.gradient,
    onboardingFee: agent.onboardingFee,
    monthlyFee: agent.monthlyFee,
    features: featuresFor(agent),
    benefits: Array.isArray(agent.benefits) ? agent.benefits as BenefitRow[] : [],
    howItWorks: Array.isArray(agent.howItWorks) ? agent.howItWorks as StepRow[] : [],
    isActive: agent.isActive,
    isFeatured: agent.isFeatured,
    sortOrder: agent.sortOrder,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-[#0e0e13] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7C6FFF]";

function AgentFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: MarketplaceAgentView;
  onClose: () => void;
  onSave: (agent: MarketplaceAgentView) => void;
}) {
  const [form, setForm] = useState<AgentFormState>(initial ? agentToForm(initial) : emptyAgentForm);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function update<K extends keyof AgentFormState>(key: K, value: AgentFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const response = await fetch(
      form.id ? `/api/internal/marketplace/${form.id}` : "/api/internal/marketplace",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const data = (await response.json().catch(() => ({}))) as {
      agent?: MarketplaceAgentView;
      error?: string;
    };
    setSaving(false);

    if (!response.ok || !data.agent) {
      toast(data.error ?? "Unable to save agent.", "error");
      return;
    }

    toast(form.id ? "Agent updated." : "Agent created.", "success");
    onSave(data.agent);
    onClose();
  }

  function addFeature() {
    const text = featureInput.trim();
    if (!text) return;
    update("features", [...form.features, text]);
    setFeatureInput("");
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#101016] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-heading text-xl font-extrabold text-white">
            {form.id ? "Edit agent" : "Add new agent"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((current) => ({ ...current, name, slug: current.id ? current.slug : slugify(name) }));
              }}
            />
          </Field>
          <Field label="Slug">
            <input className={inputClass} value={form.slug} onChange={(event) => update("slug", slugify(event.target.value))} />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={form.tagline} onChange={(event) => update("tagline", event.target.value)} />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(event) => update("category", event.target.value)}>
              {["UNIVERSAL", "HEALTHCARE", "EDUCATION", "REAL_ESTATE", "CONSTRUCTION", "RETAIL", "FINANCE"].map((item) => (
                <option key={item} value={item}>{categoryLabel(item)}</option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => update("description", event.target.value)} />
            </Field>
          </div>
          <Field label="Icon">
            <input className={inputClass} value={form.icon} onChange={(event) => update("icon", event.target.value)} />
          </Field>
          <Field label="Sort order">
            <input type="number" className={inputClass} value={form.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} />
          </Field>
          <Field label="Color primary">
            <input type="color" className="h-11 w-full rounded-xl border border-white/10 bg-[#0e0e13] p-1" value={form.colorPrimary} onChange={(event) => update("colorPrimary", event.target.value)} />
          </Field>
          <Field label="Color secondary">
            <input type="color" className="h-11 w-full rounded-xl border border-white/10 bg-[#0e0e13] p-1" value={form.colorSecondary} onChange={(event) => update("colorSecondary", event.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Gradient">
              <input className={inputClass} value={form.gradient} onChange={(event) => update("gradient", event.target.value)} />
            </Field>
            <div className="mt-3 h-16 rounded-2xl border border-white/10" style={{ background: form.gradient }} />
          </div>
          <Field label="Onboarding fee">
            <input type="number" className={inputClass} value={form.onboardingFee} onChange={(event) => update("onboardingFee", Number(event.target.value))} />
          </Field>
          <Field label="Monthly fee">
            <input type="number" className={inputClass} value={form.monthlyFee} onChange={(event) => update("monthlyFee", Number(event.target.value))} />
          </Field>

          <div className="md:col-span-2">
            <Field label="Features">
              <div className="flex gap-2">
                <input className={inputClass} value={featureInput} onChange={(event) => setFeatureInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFeature(); } }} />
                <button type="button" onClick={addFeature} className="rounded-xl bg-[#7C6FFF] px-4 text-sm font-bold">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.features.map((feature) => (
                  <button key={feature} type="button" onClick={() => update("features", form.features.filter((item) => item !== feature))} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                    {feature} ×
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <DynamicRows
            title="Benefits"
            rows={form.benefits}
            onChange={(rows) => update("benefits", rows)}
            emptyRow={{ icon: "✓", title: "", desc: "" }}
            fields={["icon", "title", "desc"]}
          />
          <DynamicRows
            title="How it works"
            rows={form.howItWorks}
            onChange={(rows) => update("howItWorks", rows)}
            emptyRow={{ step: "01", icon: "⚡", title: "", desc: "" }}
            fields={["step", "icon", "title", "desc"]}
          />

          <div className="flex gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} />
              Is active
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} />
              Is featured
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">Cancel</button>
          <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DynamicRows<T extends Record<string, string>>({
  title,
  rows,
  onChange,
  emptyRow,
  fields,
}: {
  title: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  emptyRow: T;
  fields: Array<keyof T & string>;
}) {
  return (
    <div className="md:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
        <button type="button" onClick={() => onChange([...rows, { ...emptyRow }])} className="text-xs font-bold text-[#7C6FFF]">Add row</button>
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 md:grid-cols-4">
            {fields.map((field) => (
              <input
                key={field}
                className={inputClass}
                placeholder={field}
                value={row[field]}
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, [field]: event.target.value };
                  onChange(next);
                }}
              />
            ))}
            <button type="button" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))} className="rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-200">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InternalMarketplacePage({
  user,
  agents: initialAgents,
  installations: initialInstallations,
  offers: initialOffers,
  sdes,
  customers,
  revenue,
}: InternalMarketplacePageProps) {
  const [tab, setTab] = useState<"agents" | "installations" | "offers" | "analytics">("agents");
  const [agents, setAgents] = useState(initialAgents);
  const [installations, setInstallations] = useState(initialInstallations);
  const [offers, setOffers] = useState(initialOffers);
  const [editingAgent, setEditingAgent] = useState<MarketplaceAgentView | undefined>();
  const [showAgentForm, setShowAgentForm] = useState(false);
  const { toast } = useToast();

  const installationsByAgent = useMemo(() => {
    const map = new Map<string, InternalMarketplaceInstallation[]>();
    installations.forEach((item) => map.set(item.agentId, [...(map.get(item.agentId) ?? []), item]));
    return map;
  }, [installations]);

  const chartData = agents.map((agent) => ({
    name: agent.name,
    installations: installationsByAgent.get(agent.id)?.length ?? 0,
    mrr: (installationsByAgent.get(agent.id) ?? []).filter((item) => item.status === "ACTIVE").length * agent.monthlyFee,
  }));

  const mrrGrowth = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${date.getMonth()}`, month: date.toLocaleDateString("en-IN", { month: "short" }), mrr: 0 };
    });
    installations.filter((item) => item.status === "ACTIVE").forEach((item) => {
      const date = new Date(item.activeFrom ?? item.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((entry) => entry.key === key);
      if (month) month.mrr += item.agent.monthlyFee;
    });
    return months;
  }, [installations]);

  const zeroAddonCustomers = customers.filter((customer) => customer.agentCount === 0);

  function upsertAgent(agent: MarketplaceAgentView) {
    setAgents((current) => {
      const exists = current.some((item) => item.id === agent.id);
      return exists ? current.map((item) => item.id === agent.id ? agent : item) : [...current, agent];
    });
  }

  async function patchAgent(agent: MarketplaceAgentView, data: Record<string, unknown>) {
    const response = await fetch(`/api/internal/marketplace/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = (await response.json().catch(() => ({}))) as { agent?: MarketplaceAgentView; error?: string };
    if (!response.ok || !result.agent) {
      toast(result.error ?? "Unable to update agent.", "error");
      return;
    }
    upsertAgent(result.agent);
    toast("Agent updated.", "success");
  }

  async function deleteAgent(agent: MarketplaceAgentView) {
    if ((installationsByAgent.get(agent.id)?.length ?? 0) > 0) return;
    const response = await fetch(`/api/internal/marketplace/${agent.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast("Unable to delete agent.", "error");
      return;
    }
    setAgents((current) => current.filter((item) => item.id !== agent.id));
    toast("Agent deleted.", "success");
  }

  async function updateInstallation(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/internal/marketplace/installations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => ({}))) as {
      installation?: InternalMarketplaceInstallation;
      error?: string;
    };
    if (!response.ok || !result.installation) {
      toast(result.error ?? "Unable to update installation.", "error");
      return;
    }
    setInstallations((current) => current.map((item) => item.id === id ? result.installation! : item));
    toast("Installation updated.", "success");
  }

  return (
    <div className="min-h-screen bg-[#070709] pl-[240px] text-white">
      <InternalSidebar user={user} />
      <InternalTopbar user={user} />

      <main className="pt-[60px]">
        <div className="space-y-6 p-8">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7C6FFF]">Internal</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold">Marketplace management</h1>
              <p className="mt-1 text-sm text-zinc-500">Manage agents, installations, offers, and marketplace revenue.</p>
            </div>
            <Link href="/marketplace" className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300">Open public marketplace</Link>
          </section>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#13131c] p-2">
            {[
              ["agents", "Agents"],
              ["installations", "Installations"],
              ["offers", "Offers"],
              ["analytics", "Analytics"],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTab(value as typeof tab)} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === value ? "bg-[#7C6FFF] text-white" : "text-zinc-500 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "agents" ? (
            <AgentsTab
              agents={agents}
              installationsByAgent={installationsByAgent}
              onAdd={() => { setEditingAgent(undefined); setShowAgentForm(true); }}
              onEdit={(agent) => { setEditingAgent(agent); setShowAgentForm(true); }}
              onPatch={(agent, data) => void patchAgent(agent, data)}
              onDelete={(agent) => void deleteAgent(agent)}
            />
          ) : null}

          {tab === "installations" ? (
            <InstallationsTab
              installations={installations}
              sdes={sdes}
              revenue={revenue}
              onAction={(id, body) => void updateInstallation(id, body)}
            />
          ) : null}

          {tab === "offers" ? (
            <OffersTab offers={offers} agents={agents} onCreated={(offer) => setOffers((current) => [offer, ...current])} />
          ) : null}

          {tab === "analytics" ? (
            <AnalyticsTab
              revenue={revenue}
              chartData={chartData}
              mrrGrowth={mrrGrowth}
              zeroAddonCustomers={zeroAddonCustomers}
            />
          ) : null}
        </div>
      </main>

      {showAgentForm ? (
        <AgentFormModal
          initial={editingAgent}
          onClose={() => setShowAgentForm(false)}
          onSave={upsertAgent}
        />
      ) : null}
    </div>
  );
}

function AgentsTab({
  agents,
  installationsByAgent,
  onAdd,
  onEdit,
  onPatch,
  onDelete,
}: {
  agents: MarketplaceAgentView[];
  installationsByAgent: Map<string, InternalMarketplaceInstallation[]>;
  onAdd: () => void;
  onEdit: (agent: MarketplaceAgentView) => void;
  onPatch: (agent: MarketplaceAgentView, data: Record<string, unknown>) => void;
  onDelete: (agent: MarketplaceAgentView) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-lg font-extrabold">Agents</h2>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold">
          <Plus className="h-4 w-4" /> Add new agent
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="pb-3">Icon + Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Onboarding fee</th>
              <th className="pb-3">Monthly fee</th>
              <th className="pb-3">Active installations</th>
              <th className="pb-3">Monthly MRR</th>
              <th className="pb-3">Active</th>
              <th className="pb-3">Featured</th>
              <th className="pb-3">Sort</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const activeInstallations = (installationsByAgent.get(agent.id) ?? []).filter((item) => item.status === "ACTIVE");
              const installCount = installationsByAgent.get(agent.id)?.length ?? 0;
              return (
                <tr key={agent.id} className="border-b border-white/5">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <p className="font-bold text-white">{agent.name}</p>
                        <p className="text-xs text-zinc-500">{agent.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-zinc-300">{categoryLabel(agent.category)}</td>
                  <td className="py-4 text-zinc-300">{money(agent.onboardingFee)}</td>
                  <td className="py-4 font-bold" style={{ color: agent.colorPrimary }}>{money(agent.monthlyFee)}</td>
                  <td className="py-4 text-zinc-300">{activeInstallations.length}</td>
                  <td className="py-4 text-[#22D9A0]">{money(activeInstallations.length * agent.monthlyFee)}</td>
                  <td className="py-4"><Toggle checked={agent.isActive} onChange={(value) => onPatch(agent, { isActive: value })} /></td>
                  <td className="py-4"><Toggle checked={agent.isFeatured} onChange={(value) => onPatch(agent, { isFeatured: value })} /></td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-zinc-600" />
                      <input className="w-16 rounded-lg border border-white/10 bg-[#0e0e13] px-2 py-1 text-xs" type="number" value={agent.sortOrder} onChange={(event) => onPatch(agent, { sortOrder: Number(event.target.value) })} />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => onEdit(agent)} className="rounded-lg border border-white/10 p-2 text-zinc-300"><Edit className="h-4 w-4" /></button>
                      <button type="button" disabled={installCount > 0} onClick={() => onDelete(agent)} className="rounded-lg border border-red-400/20 p-2 text-red-200 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#22D9A0]" : "bg-zinc-700"}`}>
      <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function InstallationsTab({
  installations,
  sdes,
  revenue,
  onAction,
}: {
  installations: InternalMarketplaceInstallation[];
  sdes: InternalSde[];
  revenue: MarketplaceRevenue;
  onAction: (id: string, body: Record<string, unknown>) => void;
}) {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const filtered = installations.filter((item) => {
    const statusMatch = status === "ALL" || item.status === status;
    const searchMatch = item.business.name.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Installations this month" value={revenue.totalInstallationsThisMonth} />
        <Metric title="Onboarding revenue" value={money(revenue.totalOnboardingFeeRevenue)} />
        <Metric title="Marketplace MRR" value={money(revenue.totalMonthlyMRR)} />
        <Metric title="Most popular agent" value={revenue.mostPopularAgent} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <input className={inputClass} placeholder="Search business name" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
            {["ALL", "PENDING", "PAYMENT_DONE", "SDE_BUILDING", "ACTIVE", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-white/10">
                <th className="pb-3">Business name</th>
                <th className="pb-3">Agent name</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Setup paid</th>
                <th className="pb-3">Monthly fee</th>
                <th className="pb-3">SDE assigned</th>
                <th className="pb-3">Installed date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="py-4 font-bold text-white">{item.business.name}</td>
                  <td className="py-4 text-zinc-300">{item.agent.icon} {item.agent.name}</td>
                  <td className="py-4"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(item.status)}`}>{item.status}</span></td>
                  <td className="py-4 text-zinc-300">{item.onboardingFeePaid ? "Yes" : "No"}</td>
                  <td className="py-4 text-[#22D9A0]">{money(item.agent.monthlyFee)}</td>
                  <td className="py-4">
                    {item.status === "PAYMENT_DONE" ? (
                      <select className="rounded-lg border border-white/10 bg-[#0e0e13] px-2 py-1 text-xs" defaultValue={item.sdeAssignee?.id ?? ""} onChange={(event) => event.target.value && onAction(item.id, { action: "assign_sde", sdeAssignedId: event.target.value })}>
                        <option value="">Assign SDE</option>
                        {sdes.map((sde) => <option key={sde.id} value={sde.id}>{sde.name}</option>)}
                      </select>
                    ) : item.sdeAssignee?.name ?? "Unassigned"}
                  </td>
                  <td className="py-4 text-zinc-400">{dateLabel(item.installedAt ?? item.activeFrom)}</td>
                  <td className="py-4">
                    {item.status === "PAYMENT_DONE" ? <button type="button" onClick={() => onAction(item.id, { action: "mark_building" })} className="rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold">Mark building</button> : null}
                    {item.status === "SDE_BUILDING" ? <button type="button" onClick={() => onAction(item.id, { action: "mark_active" })} className="rounded-lg bg-[#22D9A0] px-3 py-2 text-xs font-bold text-black">Mark active</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function OffersTab({ offers, agents, onCreated }: { offers: AgentOfferView[]; agents: MarketplaceAgentView[]; onCreated: (offer: AgentOfferView) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    offerType: "SETUP_WAIVED",
    discount: 0,
    isCombo: false,
    comboAgents: [] as string[],
    targetPlan: "",
    targetIndustry: "",
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: "",
    isActive: true,
  });
  const { toast } = useToast();

  async function createOffer() {
    const response = await fetch("/api/internal/marketplace/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, validFrom: new Date(form.validFrom), validUntil: form.validUntil ? new Date(form.validUntil) : undefined }),
    });
    const data = (await response.json().catch(() => ({}))) as { offer?: AgentOfferView; error?: string };
    if (!response.ok || !data.offer) {
      toast(data.error ?? "Unable to create offer.", "error");
      return;
    }
    onCreated(data.offer);
    setShowForm(false);
    toast("Offer created.", "success");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-lg font-extrabold">Offers</h2>
        <button type="button" onClick={() => setShowForm(true)} className="rounded-xl bg-[#7C6FFF] px-4 py-2 text-sm font-bold">Create offer</button>
      </div>
      {showForm ? (
        <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2">
          <input className={inputClass} placeholder="Offer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <select className={inputClass} value={form.offerType} onChange={(event) => setForm({ ...form, offerType: event.target.value })}>
            <option value="SETUP_WAIVED">Setup fee waived</option>
            <option value="MONTHLY_DISCOUNT">Monthly discount</option>
            <option value="FIRST_MONTH_FREE">First month free</option>
            <option value="COMBO_DISCOUNT">Combo discount</option>
            <option value="PERCENTAGE_OFF">Percentage off</option>
          </select>
          <textarea className={`${inputClass} md:col-span-2`} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input type="number" className={inputClass} placeholder="Discount amount or percentage" value={form.discount} onChange={(event) => setForm({ ...form, discount: Number(event.target.value) })} />
          <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={form.isCombo} onChange={(event) => setForm({ ...form, isCombo: event.target.checked })} /> Is combo</label>
          {form.isCombo ? (
            <select multiple className={`${inputClass} md:col-span-2`} value={form.comboAgents} onChange={(event) => setForm({ ...form, comboAgents: Array.from(event.target.selectedOptions).map((option) => option.value) })}>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
            </select>
          ) : null}
          <select className={inputClass} value={form.targetPlan} onChange={(event) => setForm({ ...form, targetPlan: event.target.value })}>
            <option value="">All plans</option><option value="starter">Starter</option><option value="growth">Growth</option><option value="scale">Scale</option>
          </select>
          <select className={inputClass} value={form.targetIndustry} onChange={(event) => setForm({ ...form, targetIndustry: event.target.value })}>
            <option value="">All industries</option><option value="healthcare">Healthcare</option><option value="education">Education</option><option value="real_estate">Real Estate</option><option value="retail">Retail</option><option value="finance">Finance</option>
          </select>
          <input type="date" className={inputClass} value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} />
          <input type="date" className={inputClass} value={form.validUntil} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} />
          <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Is active</label>
          <button type="button" onClick={() => void createOffer()} className="rounded-xl bg-[#22D9A0] px-4 py-2 text-sm font-bold text-black">Save offer</button>
        </div>
      ) : null}
      <div className="grid gap-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-xl border border-white/10 bg-[#0e0e13] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-heading font-extrabold">{offer.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{offer.description}</p>
              </div>
              <div className="text-sm text-zinc-300">{offer.offerType} · {offer.discount} · Used {offer.usageCount}</div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Target: {offer.targetPlan ?? "all plans"} / {offer.targetIndustry ?? "all industries"} · {new Date(offer.validFrom).toLocaleDateString("en-IN")} - {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString("en-IN") : "Permanent"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalyticsTab({
  revenue,
  chartData,
  mrrGrowth,
  zeroAddonCustomers,
}: {
  revenue: MarketplaceRevenue;
  chartData: Array<{ name: string; installations: number; mrr: number }>;
  mrrGrowth: Array<{ month: string; mrr: number }>;
  zeroAddonCustomers: InternalCustomer[];
}) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Total Marketplace MRR" value={money(revenue.totalMonthlyMRR)} />
        <Metric title="Total installations" value={revenue.totalInstallationsThisMonth} />
        <Metric title="Avg agents/customer" value={revenue.averageAgentsPerCustomer.toFixed(1)} />
        <Metric title="Setup revenue this month" value={money(revenue.setupFeeRevenueThisMonth)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Installations per agent">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,.1)" }} />
            <Bar dataKey="installations" fill="#7C6FFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartPanel>
        <ChartPanel title="Marketplace MRR growth">
          <LineChart data={mrrGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip contentStyle={{ background: "#111118", border: "1px solid rgba(255,255,255,.1)" }} />
            <Line type="monotone" dataKey="mrr" stroke="#22D9A0" strokeWidth={3} dot={false} />
          </LineChart>
        </ChartPanel>
      </div>
      <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
        <h2 className="font-heading text-lg font-extrabold">Customers with zero add-ons</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500"><tr className="border-b border-white/10"><th className="pb-3">Name</th><th className="pb-3">Plan</th><th className="pb-3">Industry</th><th className="pb-3">Action</th></tr></thead>
            <tbody>
              {zeroAddonCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-white/5">
                  <td className="py-4 font-bold">{customer.name}</td>
                  <td className="py-4 text-zinc-300">{customer.plan}</td>
                  <td className="py-4 text-zinc-300">{customer.industry}</td>
                  <td className="py-4"><button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#7C6FFF] px-3 py-2 text-xs font-bold"><Send className="h-3.5 w-3.5" /> Send recommendation</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <h2 className="mb-5 font-heading text-lg font-extrabold">{title}</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
