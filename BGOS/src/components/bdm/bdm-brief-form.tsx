"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { useToast } from "@/components/ui/toast";

export type OnboardingLeadForBDM = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  employeeCount: string;
  businessType: string;
  challenge: string | null;
  status: string;
  createdAt: string | Date;
  bdmSubmittedAt: string | Date | null;
  selectedPlan: string | null;
  assignedSDE?: { id: string; name: string; email: string } | null;
};

type BdmBriefFormProps = {
  lead: OnboardingLeadForBDM;
  onSuccess: () => void;
  onClose: () => void;
};

const plans = [
  {
    id: "STARTER",
    name: "Starter",
    price: "₹799",
    features: "Lead capture, basic CRM, NEXA tips",
    commission: "₹400",
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "₹2,499",
    features: "Pipelines, team tracking, automation",
    commission: "₹1,500",
  },
  {
    id: "SCALE",
    name: "Scale",
    price: "₹6,999",
    features: "Advanced workflows, reporting, SDE support",
    commission: "₹3,500",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    features: "Custom setup, integrations, priority support",
    commission: "₹7,000",
  },
];

const roleSuggestions = ["Owner", "Manager", "Sales Executive", "Technical", "Support"];
const toolSuggestions = ["Excel", "WhatsApp", "Google Sheets", "Tally", "Zoho"];

function emptyRole() {
  return { roleName: "", count: "1", reportsTo: "" };
}

export function BdmBriefForm({ lead, onSuccess, onClose }: BdmBriefFormProps) {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [roles, setRoles] = useState([emptyRole()]);
  const [salesProcess, setSalesProcess] = useState("");
  const [mainChallenge, setMainChallenge] = useState(lead.challenge ?? "");
  const [estimatedLeadsPerMonth, setEstimatedLeadsPerMonth] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [privateNotes, setPrivateNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(
    () => selectedPlan && products.length > 0 && salesProcess.trim().length >= 50,
    [products.length, salesProcess, selectedPlan],
  );

  function addProduct(value = productInput) {
    const item = value.trim();
    if (!item || products.includes(item)) return;
    setProducts((current) => [...current, item]);
    setProductInput("");
  }

  function addTool(value = toolInput) {
    const item = value.trim();
    if (!item || tools.includes(item)) return;
    setTools((current) => [...current, item]);
    setToolInput("");
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!selectedPlan) next.plan = "Select a plan.";
    if (products.length === 0) next.products = "Add at least one product or service.";
    if (salesProcess.trim().length < 50) {
      next.salesProcess = "Describe the process in at least 50 characters.";
    }
    if (!mainChallenge.trim()) next.mainChallenge = "Main challenge is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const response = await fetch("/api/onboarding/bdm-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboardingLeadId: lead.id,
        selectedPlan,
        products,
        teamStructure: roles.filter((role) => role.roleName.trim()),
        salesProcess,
        mainChallenge,
        estimatedLeadsPerMonth: Number(estimatedLeadsPerMonth) || 0,
        additionalRequirements,
        preferredLanguage,
        currentTools: tools,
        notes: privateNotes,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      toast("Could not submit brief", "error");
      return;
    }

    setSuccess(true);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close brief drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-white/10 bg-[#0d0d11] text-white shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="font-heading text-lg font-bold">
              Submit brief for {lead.companyName}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Fill in everything you learned from your discovery call.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22D9A0]/10 text-3xl text-[#22D9A0]">
                ✓
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold">
                Brief submitted.
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                SDE has been notified and will build the workspace within 24 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-xl bg-[#22D9A0] px-5 py-3 text-sm font-bold text-black"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex-1 space-y-7 overflow-y-auto p-5">
            <section>
              <h3 className="font-heading text-sm font-bold">Plan confirmation</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedPlan === plan.id
                        ? "border-[#22D9A0] bg-[#22D9A0]/10"
                        : "border-white/10 bg-[#13131c] hover:border-white/20"
                    }`}
                  >
                    <p className="font-heading text-base font-bold">{plan.name}</p>
                    <p className="mt-1 text-sm font-bold text-[#22D9A0]">{plan.price}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{plan.features}</p>
                    <p className="mt-3 text-xs font-bold text-[#F5A623]">
                      Commission {plan.commission}
                    </p>
                  </button>
                ))}
              </div>
              {errors.plan ? <p className="mt-2 text-xs text-[#FF6B6B]">{errors.plan}</p> : null}
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold">Products and services</h3>
              <div className="mt-3 flex gap-2">
                <input
                  value={productInput}
                  onChange={(event) => setProductInput(event.target.value)}
                  placeholder="Solar panels"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                />
                <button
                  type="button"
                  onClick={() => addProduct()}
                  className="rounded-xl bg-[#22D9A0] px-3 py-2 text-sm font-bold text-black"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {products.map((product) => (
                  <button
                    key={product}
                    type="button"
                    onClick={() => setProducts(products.filter((item) => item !== product))}
                    className="rounded-full bg-[#22D9A0]/10 px-3 py-1 text-xs font-bold text-[#22D9A0]"
                  >
                    {product} ×
                  </button>
                ))}
              </div>
              {errors.products ? <p className="mt-2 text-xs text-[#FF6B6B]">{errors.products}</p> : null}
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold">Team structure</h3>
              <div className="mt-3 space-y-2">
                {roles.map((role, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_80px_1fr_36px]">
                    <input
                      value={role.roleName}
                      onChange={(event) =>
                        setRoles((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, roleName: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Role name"
                      className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                    />
                    <input
                      value={role.count}
                      onChange={(event) =>
                        setRoles((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, count: event.target.value } : item,
                          ),
                        )
                      }
                      type="number"
                      min="1"
                      className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                    />
                    <input
                      value={role.reportsTo}
                      onChange={(event) =>
                        setRoles((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, reportsTo: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Reports to"
                      className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                    />
                    <button
                      type="button"
                      onClick={() => setRoles(roles.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded-xl border border-white/10 text-zinc-500 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {roleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setRoles((current) => [...current, { ...emptyRole(), roleName: suggestion }])}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    + {suggestion}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRoles((current) => [...current, emptyRole()])}
                  className="inline-flex items-center gap-1 rounded-full border border-[#22D9A0]/30 px-3 py-1 text-xs font-bold text-[#22D9A0]"
                >
                  <Plus className="h-3 w-3" />
                  Add row
                </button>
              </div>
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold">Sales process</h3>
              <textarea
                value={salesProcess}
                onChange={(event) => setSalesProcess(event.target.value)}
                rows={5}
                placeholder="e.g. Customer calls → site visit → quotation → approval → installation → payment."
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
              />
              {errors.salesProcess ? <p className="mt-2 text-xs text-[#FF6B6B]">{errors.salesProcess}</p> : null}
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold">Key details</h3>
              <div className="mt-3 grid gap-3">
                <input
                  value={mainChallenge}
                  onChange={(event) => setMainChallenge(event.target.value)}
                  placeholder="Main challenge"
                  className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                />
                <input
                  value={estimatedLeadsPerMonth}
                  onChange={(event) => setEstimatedLeadsPerMonth(event.target.value)}
                  type="number"
                  min="0"
                  placeholder="Estimated leads per month"
                  className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                />
                <div className="flex gap-2">
                  <input
                    value={toolInput}
                    onChange={(event) => setToolInput(event.target.value)}
                    placeholder="Current tools"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                  />
                  <button
                    type="button"
                    onClick={() => addTool()}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...toolSuggestions, ...tools].filter((item, index, array) => array.indexOf(item) === index).map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() =>
                        tools.includes(tool)
                          ? setTools(tools.filter((item) => item !== tool))
                          : addTool(tool)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        tools.includes(tool)
                          ? "bg-[#7C6FFF]/15 text-[#c6c1ff]"
                          : "border border-white/10 text-zinc-500"
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
                <textarea
                  value={additionalRequirements}
                  onChange={(event) => setAdditionalRequirements(event.target.value)}
                  rows={3}
                  placeholder="Special requirements or notes"
                  className="resize-none rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                />
                <select
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
                >
                  {["English", "Hindi", "Tamil", "Telugu", "Malayalam"].map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </select>
              </div>
              {errors.mainChallenge ? <p className="mt-2 text-xs text-[#FF6B6B]">{errors.mainChallenge}</p> : null}
            </section>

            <section>
              <h3 className="font-heading text-sm font-bold">BDM notes</h3>
              <textarea
                value={privateNotes}
                onChange={(event) => setPrivateNotes(event.target.value)}
                rows={4}
                placeholder="Anything else the SDE should know when building this workspace."
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm outline-none focus:border-[#22D9A0]"
              />
            </section>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full rounded-xl bg-[#22D9A0] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#5ee0b0] disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit to SDE for building →"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
