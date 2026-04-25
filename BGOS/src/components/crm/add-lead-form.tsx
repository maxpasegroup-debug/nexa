"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { CrmLead, TeamMember } from "@/components/crm/types";

type AddLeadFormProps = {
  teamMembers: TeamMember[];
  onSuccess: (lead: CrmLead) => void;
  onClose: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  value: string;
  assignedTo: string;
  followUpDate: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  company: "",
  source: "MANUAL",
  value: "",
  assignedTo: "",
  followUpDate: "",
  notes: "",
};

function inputClass(error?: string) {
  return `w-full rounded-xl border bg-[#13131c] px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20 ${
    error ? "border-[#FF6B6B]" : "border-white/10"
  }`;
}

function validate(form: FormState) {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email.";
  }

  if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
    errors.phone = "Phone must be 10 digits.";
  }

  if (form.value && Number(form.value) <= 0) {
    errors.value = "Value must be positive.";
  }

  return errors;
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="mt-1 text-xs text-[#FF6B6B]">{error}</p> : null;
}

export function AddLeadForm({
  teamMembers,
  onSuccess,
  onClose,
}: AddLeadFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isOpen = true;
  const realtimeErrors = useMemo(() => validate(form), [form]);

  useEffect(() => {
    setErrors((current) => ({ ...current, ...realtimeErrors }));
  }, [realtimeErrors]);

  function updateField(field: keyof FormState, value: string) {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors(validate(nextForm));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        company: form.company || undefined,
        source: form.source,
        value: form.value ? Number(form.value) : 0,
        notes: form.notes || undefined,
        assignedTo: form.assignedTo || undefined,
        followUpDate: form.followUpDate || undefined,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      toast("Unable to add lead", "error");
      return;
    }

    const data = (await response.json()) as { lead: CrmLead };
    onSuccess(data.lead);
    toast("Lead added and scored by NEXA", "success");
    window.setTimeout(onClose, 150);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close add lead overlay"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[400px] max-w-[100vw] flex-col border-l border-[rgba(255,255,255,0.07)] bg-[#0d0d11] text-white transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex h-[64px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:text-white"
            aria-label="Close add lead form"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-heading text-lg font-bold">Add lead</h2>
        </header>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">
              Name
            </label>
            <input
              className={inputClass(errors.name)}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Lead name"
            />
            <FieldError error={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Phone
              </label>
              <input
                className={inputClass(errors.phone)}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="9876543210"
              />
              <FieldError error={errors.phone} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Email
              </label>
              <input
                className={inputClass(errors.email)}
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="name@company.com"
              />
              <FieldError error={errors.email} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">
              Company
            </label>
            <input
              className={inputClass(errors.company)}
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Source
              </label>
              <select
                className={inputClass(errors.source)}
                value={form.source}
                onChange={(event) => updateField("source", event.target.value)}
              >
                {[
                  "MANUAL",
                  "WEBSITE",
                  "REFERRAL",
                  "INSTAGRAM",
                  "WHATSAPP",
                  "EMAIL",
                  "COLD_CALL",
                  "OTHER",
                ].map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Value
              </label>
              <input
                className={inputClass(errors.value)}
                type="number"
                min="0"
                value={form.value}
                onChange={(event) => updateField("value", event.target.value)}
                placeholder="50000"
              />
              <FieldError error={errors.value} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Assigned to
              </label>
              <select
                className={inputClass(errors.assignedTo)}
                value={form.assignedTo}
                onChange={(event) =>
                  updateField("assignedTo", event.target.value)
                }
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">
                Follow-up
              </label>
              <input
                className={inputClass(errors.followUpDate)}
                type="datetime-local"
                value={form.followUpDate}
                onChange={(event) =>
                  updateField("followUpDate", event.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">
              Notes
            </label>
            <textarea
              className={inputClass(errors.notes)}
              rows={4}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Add context for NEXA..."
            />
          </div>

          <Button type="submit" fullWidth loading={submitting}>
            Add lead
          </Button>
        </form>
      </aside>
    </>
  );
}
