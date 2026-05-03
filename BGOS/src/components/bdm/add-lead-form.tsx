"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/toast";
import { SimpleLead } from "./simple-lead-types";

type AddLeadFormProps = {
  onSuccess: (lead: SimpleLead) => void;
  onClose?: () => void;
};

type LeadKind = "new_customer" | "agent_upsell";

type BdmCustomer = {
  id: string;
  name: string;
  plan: string;
  status: string;
  bossName?: string | null;
  bossPhone?: string | null;
  bossEmail?: string | null;
};

const LEAD_TYPES: Array<{
  id: LeadKind;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  border: string;
}> = [
  {
    id: "new_customer",
    icon: "👤",
    title: "New customer",
    subtitle: "Business not yet using BGOS",
    color: "rgba(124,111,255,0.15)",
    border: "rgba(124,111,255,0.3)",
  },
  {
    id: "agent_upsell",
    icon: "⚡",
    title: "Agent upsell",
    subtitle: "Existing BGOS customer wants an add-on agent",
    color: "rgba(34,217,160,0.08)",
    border: "rgba(34,217,160,0.25)",
  },
];

const LEAD_SOURCES = [
  { label: "Cold call", value: "COLD_CALL" },
  { label: "WhatsApp outreach", value: "COLD_WHATSAPP" },
  { label: "LinkedIn", value: "LINKEDIN" },
  { label: "Personal referral", value: "PERSONAL_REFERRAL" },
  { label: "Field visit", value: "FIELD_VISIT" },
  { label: "Event", value: "EVENT" },
  { label: "Other", value: "OTHER" },
];

const AGENTS = [
  { slug: "sales-booster", icon: "⚡", name: "Sales Booster", setup: 5999, monthly: 1499, bdmComm: 750, color: "#7C6FFF" },
  { slug: "wazzup", icon: "💬", name: "Wazzup", setup: 3999, monthly: 999, bdmComm: 500, color: "#25D366" },
  { slug: "taxmate", icon: "🧾", name: "TaxMate", setup: 1999, monthly: 799, bdmComm: 400, color: "#F5A623" },
  { slug: "peopledesk", icon: "👥", name: "PeopleDesk", setup: 3999, monthly: 799, bdmComm: 400, color: "#22D9A0" },
  { slug: "sitesync", icon: "🏗️", name: "SiteSync", setup: 5999, monthly: 1499, bdmComm: 750, color: "#7C6FFF" },
  { slug: "careloop", icon: "🏥", name: "CareLoop", setup: 4999, monthly: 1299, bdmComm: 650, color: "#22D9A0" },
  { slug: "eduflow", icon: "🎓", name: "EduFlow", setup: 3999, monthly: 999, bdmComm: 500, color: "#F5A623" },
  { slug: "classmate", icon: "🏫", name: "ClassMate", setup: 4999, monthly: 1299, bdmComm: 650, color: "#7C6FFF" },
  { slug: "proppilot", icon: "🏢", name: "PropPilot", setup: 3999, monthly: 1299, bdmComm: 650, color: "#F5A623" },
  { slug: "stocksense", icon: "🏪", name: "StockSense", setup: 3999, monthly: 999, bdmComm: 500, color: "#22D9A0" },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none focus:border-[#7C6FFF]";

function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function AddLeadForm({ onSuccess, onClose }: AddLeadFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [leadKind, setLeadKind] = useState<LeadKind>("new_customer");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("COLD_CALL");
  const [callNotes, setCallNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [customers, setCustomers] = useState<BdmCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(AGENTS[0].slug);
  const [upsellNotes, setUpsellNotes] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      setCustomersLoading(true);
      const response = await fetch("/api/bdm/customers", { cache: "no-store" });
      setCustomersLoading(false);
      if (!response.ok) return;
      const data = (await response.json()) as { live?: BdmCustomer[] };
      setCustomers(data.live ?? []);
      setSelectedCustomerId((current) => current || data.live?.[0]?.id || "");
    }

    void loadCustomers();
  }, []);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  const selectedAgent = AGENTS.find((agent) => agent.slug === selectedAgentSlug) ?? AGENTS[0];
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.plan, customer.bossName, customer.bossPhone, customer.bossEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [customerSearch, customers]);

  async function submitNewCustomer() {
    const details = [
      location ? `Location: ${location}` : "",
      industryType ? `Industry type: ${industryType}` : "",
      teamSize ? `Team size: ${teamSize}` : "",
      callNotes ? `Call notes: ${callNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: companyName,
        name: contactName,
        phone,
        email: email || undefined,
        source,
        leadSource: source,
        leadType: "SELF",
        bdmStatus: "NEW",
        initialNotes: details,
        followUpDate: followUpDate || undefined,
        followUpTime: followUpTime || undefined,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { lead?: SimpleLead; error?: string };
    if (!response.ok || !data.lead) throw new Error(data.error ?? "Could not add lead");
    onSuccess(data.lead);
    toast(
      followUpDate
        ? `Lead added. NEXA will remind you on ${new Date(followUpDate).toLocaleDateString("en-IN")}.`
        : "Lead added.",
      "success",
    );
    onClose?.();
  }

  async function submitAgentUpsell() {
    if (!selectedCustomer) throw new Error("Choose an existing customer first.");

    const initialNotes = [
      `Agent upsell for existing customer ${selectedCustomer.name}.`,
      `Interested in ${selectedAgent.name}. Agent slug: ${selectedAgent.slug}.`,
      `Customer business ID: ${selectedCustomer.id}.`,
      upsellNotes ? `BDM notes: ${upsellNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: selectedCustomer.name,
        name: selectedCustomer.bossName ?? selectedCustomer.name,
        phone: selectedCustomer.bossPhone ?? undefined,
        email: selectedCustomer.bossEmail ?? undefined,
        leadType: "PLATFORM",
        leadSource: "MARKETPLACE",
        source: "MARKETPLACE",
        agentInterest: selectedAgent.slug,
        businessId: selectedCustomer.id,
        customerBusinessId: selectedCustomer.id,
        bdmStatus: "NEW",
        notes: initialNotes,
        initialNotes,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { lead?: SimpleLead; error?: string };
    if (!response.ok || !data.lead) throw new Error(data.error ?? "Could not create agent lead");
    onSuccess(data.lead);

    const sessionResponse = await fetch("/api/onboarding/agent-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: selectedCustomer.id, agentSlug: selectedAgent.slug }),
    });
    const sessionData = (await sessionResponse.json().catch(() => ({}))) as {
      sessionId?: string;
      error?: string;
    };
    if (!sessionResponse.ok || !sessionData.sessionId) {
      throw new Error(sessionData.error ?? "Lead created, but NEXA session could not start.");
    }

    toast("NEXA agent session started.", "success");
    onClose?.();
    router.push(`/bdm/agent-onboarding/${sessionData.sessionId}`);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (leadKind === "new_customer" && (!companyName.trim() || !contactName.trim() || !phone.trim())) return;

    setLoading(true);
    try {
      if (leadKind === "new_customer") {
        await submitNewCustomer();
      } else {
        await submitAgentUpsell();
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save lead", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-[560px] flex-col border-l border-white/10 bg-[#101016] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-heading text-xl font-bold text-white">Add lead</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {LEAD_TYPES.map((type) => {
              const active = leadKind === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setLeadKind(type.id)}
                  className="rounded-xl border p-4 text-center transition"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    borderColor: active ? type.border : "rgba(255,255,255,0.1)",
                    backgroundColor: active ? type.color : "rgba(255,255,255,0.03)",
                  }}
                >
                  <span className="block text-[28px] leading-none">{type.icon}</span>
                  <span className="mt-3 block font-heading text-[13px] font-bold text-white">{type.title}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-zinc-500">{type.subtitle}</span>
                </button>
              );
            })}
          </div>

          {leadKind === "new_customer" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-bold text-zinc-400">Company name</span>
                  <input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className="text-xs font-bold text-zinc-400">Contact name</span>
                  <input required value={contactName} onChange={(event) => setContactName(event.target.value)} className={inputClass} />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-bold text-zinc-400">Phone/WhatsApp</span>
                  <input required value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className="text-xs font-bold text-zinc-400">Location</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City" className={inputClass} />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-bold text-zinc-400">Industry type</span>
                  <input value={industryType} onChange={(event) => setIndustryType(event.target.value)} placeholder="Solar EPC, Clinic, Real Estate" className={inputClass} />
                </label>
                <label>
                  <span className="text-xs font-bold text-zinc-400">Team size</span>
                  <input value={teamSize} onChange={(event) => setTeamSize(event.target.value)} className={inputClass} />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-zinc-400">Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
              </label>

              <section>
                <p className="mb-2 text-xs font-bold text-zinc-400">How did you find this lead?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LEAD_SOURCES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSource(item.value)}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                        source === item.value
                          ? "border-[#7C6FFF] bg-[#7C6FFF]/15 text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <label className="block">
                <span className="text-xs font-bold text-zinc-400">Call notes — what did they say?</span>
                <textarea
                  value={callNotes}
                  onChange={(event) => setCallNotes(event.target.value)}
                  className="mt-1 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#7C6FFF]"
                />
                <span className="mt-2 block rounded-xl border border-[#22D9A0]/20 bg-[#22D9A0]/10 px-3 py-2 text-xs text-[#22D9A0]">
                  💡 NEXA reads these notes to coach you. The more detail the better.
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-bold text-zinc-400">Follow-up date</span>
                  <input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className={inputClass} />
                </label>
                <label>
                  <span className="text-xs font-bold text-zinc-400">Follow-up time</span>
                  <input type="time" value={followUpTime} onChange={(event) => setFollowUpTime(event.target.value)} className={inputClass} />
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-extrabold text-black disabled:opacity-60">
                {loading ? "Saving..." : "Save lead + set reminder →"}
              </button>
            </>
          ) : (
            <>
              <section>
                <label className="block">
                  <span className="text-xs font-bold text-zinc-400">Which existing customer?</span>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search customers..." className="w-full rounded-xl border border-white/10 bg-[#0e0e13] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-[#22D9A0]" />
                  </div>
                </label>

                {customersLoading ? <p className="mt-3 text-xs text-zinc-500">Loading customers...</p> : null}
                {!customersLoading && customers.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 p-4 text-sm text-zinc-300">
                    <p>You have no active customers yet. Add a new customer first.</p>
                    <button type="button" onClick={() => setLeadKind("new_customer")} className="mt-3 rounded-xl bg-[#7C6FFF] px-4 py-2 text-xs font-extrabold text-white">
                      Add new customer
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                    {filteredCustomers.map((customer) => {
                      const active = selectedCustomerId === customer.id;
                      return (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                            active ? "border-[#22D9A0]/50 bg-[#22D9A0]/10" : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-white">{customer.name}</span>
                            <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{customer.plan}</span>
                          </span>
                          {active ? <Check className="h-4 w-4 text-[#22D9A0]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <p className="mb-2 text-xs font-bold text-zinc-400">Which agent are they interested in?</p>
                <div className="grid grid-cols-2 gap-2">
                  {AGENTS.map((agent) => {
                    const active = selectedAgentSlug === agent.slug;
                    return (
                      <button
                        key={agent.slug}
                        type="button"
                        onClick={() => setSelectedAgentSlug(agent.slug)}
                        className={`relative rounded-xl border p-3 text-left transition ${
                          active ? "border-[#22D9A0] bg-[#22D9A0]/10" : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        {active ? <Check className="absolute right-2 top-2 h-4 w-4 text-[#22D9A0]" /> : null}
                        <span className="text-[20px]">{agent.icon}</span>
                        <span className="mt-2 block font-heading text-[12px] font-bold text-white">{agent.name}</span>
                        <span className="mt-1 block text-[10px] text-zinc-500 line-through">{rupees(agent.setup)} setup</span>
                        <span className="block text-xs font-bold" style={{ color: agent.color }}>{rupees(agent.monthly)}/mo</span>
                        <span className="mt-1 block text-[10px] font-bold text-[#22D9A0]">Your commission: {rupees(agent.bdmComm)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <label className="block">
                <span className="text-xs font-bold text-zinc-400">BDM notes</span>
                <textarea
                  value={upsellNotes}
                  onChange={(event) => setUpsellNotes(event.target.value)}
                  placeholder="What did the customer say about why they want this agent? Any specific requirements?"
                  className="mt-1 min-h-24 w-full resize-none rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#22D9A0]"
                />
              </label>

              <button type="submit" disabled={loading || !selectedCustomer} className="w-full rounded-xl bg-gradient-to-r from-[#22D9A0] to-[#7CFFCB] px-5 py-3 text-sm font-extrabold text-black disabled:opacity-60">
                {loading ? "Starting..." : "Start NEXA agent session →"}
              </button>
            </>
          )}
        </form>
      </aside>
    </div>
  );
}
