"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CrmLead, TeamMember } from "@/components/crm/types";

type LeadActivity = {
  id: string;
  type: string;
  note: string;
  createdAt: string | Date;
  user: {
    name: string;
    role: string;
  };
};

type Reminder = {
  id: string;
  message: string;
  dueAt: string | Date;
  sent: boolean;
  user: {
    id?: string;
    name: string;
    role: string;
  };
};

type LeadDetails = CrmLead & {
  activities: LeadActivity[];
  reminders: Reminder[];
};

type LeadDrawerProps = {
  leadId: string | null;
  onClose: () => void;
  teamMembers: TeamMember[];
  onLeadUpdate?: (lead: CrmLead) => void;
  allowReassign?: boolean;
};

type EditForm = {
  name: string;
  phone: string;
  email: string;
  company: string;
  value: string;
  source: string;
  status: string;
  assignedTo: string;
  followUpDate: string;
};

const statusStyles: Record<string, string> = {
  NEW: "border-[#6B6878]/30 bg-[#6B6878]/10 text-zinc-300",
  CONTACTED: "border-[#7C6FFF]/30 bg-[#7C6FFF]/10 text-[#b8b2ff]",
  DEMO: "border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623]",
  PROPOSAL: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]",
  WON: "border-[#22D9A0]/30 bg-[#22D9A0]/10 text-[#22D9A0]",
  LOST: "border-[#FF6B6B]/30 bg-[#FF6B6B]/10 text-[#FF6B6B]",
};

function scoreColor(score: number) {
  if (score <= 40) return "#FF6B6B";
  if (score <= 70) return "#F5A623";
  return "#22D9A0";
}

function toDateTimeLocal(value?: string | Date | null) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function timeAgo(createdAt: string | Date) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000),
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildEditForm(lead: LeadDetails): EditForm {
  return {
    name: lead.name ?? "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    company: lead.company ?? "",
    value: String(lead.value ?? 0),
    source: lead.source ?? "MANUAL",
    status: lead.status ?? "NEW",
    assignedTo: lead.assignedTo ?? "",
    followUpDate: toDateTimeLocal(lead.followUpDate),
  };
}

function Field({
  label,
  value,
  editing,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group space-y-2">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      {editing ? (
        children
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-0 py-1 text-sm text-zinc-200 transition group-hover:border-white/10 group-hover:px-3">
          <span className="min-h-5 truncate">{value || "Not set"}</span>
          <Edit2 className="hidden h-3.5 w-3.5 text-zinc-600 group-hover:block" />
        </div>
      )}
    </div>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-white/10 bg-[#13131c] px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20";
}

export function LeadDrawer({
  leadId,
  onClose,
  teamMembers,
  onLeadUpdate,
  allowReassign = true,
}: LeadDrawerProps) {
  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [activityType, setActivityType] = useState("Call");
  const [activityNote, setActivityNote] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDueAt, setReminderDueAt] = useState("");
  const [reminderUserId, setReminderUserId] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [lostLoading, setLostLoading] = useState(false);

  const isOpen = Boolean(leadId);
  const sortedActivities = useMemo(
    () =>
      lead?.activities
        ? [...lead.activities].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )
        : [],
    [lead?.activities],
  );

  useEffect(() => {
    async function loadLead(id: string) {
      setLoading(true);
      setLead(null);
      setEditMode(false);

      const response = await fetch(`/api/leads/${id}`, {
        cache: "no-store",
      });

      setLoading(false);

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { lead: LeadDetails };
      setLead(data.lead);
      setForm(buildEditForm(data.lead));
      setReminderUserId(data.lead.assignedTo ?? teamMembers[0]?.id ?? "");
    }

    if (leadId) {
      void loadLead(leadId);
    }
  }, [leadId, teamMembers]);

  async function saveChanges() {
    if (!lead || !form) return;

    setSaving(true);
    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        company: form.company || null,
        value: Number(form.value) || 0,
        source: form.source,
        status: form.status,
        ...(allowReassign ? { assignedTo: form.assignedTo || null } : {}),
        followUpDate: form.followUpDate || null,
      }),
    });
    setSaving(false);

    if (!response.ok) return;

    const data = (await response.json()) as { lead: LeadDetails };
    setLead((current) =>
      current
        ? {
            ...current,
            ...data.lead,
            activities: current.activities,
            reminders: current.reminders,
          }
        : data.lead,
    );
    onLeadUpdate?.(data.lead);
    setEditMode(false);
  }

  async function rescoreLead() {
    if (!lead) return;

    setScoring(true);
    const response = await fetch(`/api/leads/${lead.id}/score`, {
      method: "POST",
    });
    setScoring(false);

    if (!response.ok) return;

    const data = (await response.json()) as { score: number; reason: string };
    setLead((current) =>
      current
        ? { ...current, score: data.score, scoreReason: data.reason }
        : current,
    );
    if (lead) {
      onLeadUpdate?.({ ...lead, score: data.score, scoreReason: data.reason });
    }
  }

  async function logActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || !activityNote.trim()) return;

    setActivityLoading(true);
    const response = await fetch(`/api/leads/${lead.id}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activityType, note: activityNote }),
    });
    setActivityLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { activity: LeadActivity };
    setLead((current) =>
      current
        ? { ...current, activities: [data.activity, ...current.activities] }
        : current,
    );
    setActivityNote("");
  }

  async function createReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || !reminderMessage.trim() || !reminderDueAt || !reminderUserId) {
      return;
    }

    setReminderLoading(true);
    const response = await fetch("/api/leads/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        userId: reminderUserId,
        message: reminderMessage,
        dueAt: reminderDueAt,
      }),
    });
    setReminderLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { reminder: Reminder };
    const member = teamMembers.find((item) => item.id === reminderUserId);
    setLead((current) =>
      current
        ? {
            ...current,
            reminders: [
              {
                ...data.reminder,
                user: data.reminder.user ?? {
                  id: reminderUserId,
                  name: member?.name ?? "Team member",
                  role: member?.role ?? "BDM",
                },
              },
              ...current.reminders,
            ],
          }
        : current,
    );
    setReminderMessage("");
    setReminderDueAt("");
    setShowReminderForm(false);
  }

  async function markLost() {
    if (!lead) return;

    setLostLoading(true);
    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "LOST", lostReason }),
    });
    setLostLoading(false);

    if (!response.ok) return;

    const data = (await response.json()) as { lead: LeadDetails };
    setLead((current) =>
      current
        ? {
            ...current,
            ...data.lead,
            activities: current.activities,
            reminders: current.reminders,
          }
        : data.lead,
    );
    onLeadUpdate?.(data.lead);
    setDangerOpen(false);
  }

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close lead drawer overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50"
        />
      ) : null}

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[420px] max-w-[100vw] flex-col border-l border-[rgba(255,255,255,0.07)] bg-[#0d0d11] text-white transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex h-[64px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:text-white"
            aria-label="Close lead drawer"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="min-w-0 flex-1 truncate font-heading text-lg font-bold">
            {lead?.name ?? "Lead profile"}
          </h2>
          {lead ? (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                statusStyles[lead.status]
              }`}
            >
              {lead.status}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setEditMode((value) => !value)}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:text-white"
            aria-label="Toggle edit mode"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-zinc-400">Loading lead...</p>
          ) : lead && form ? (
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="font-heading text-base font-bold">
                  Contact info
                </h3>
                <Field label="Name" value={lead.name} editing={editMode}>
                  <input
                    className={inputClass()}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone" value={lead.phone ?? ""} editing={editMode}>
                    <input
                      className={inputClass()}
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Email" value={lead.email ?? ""} editing={editMode}>
                    <input
                      className={inputClass()}
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Company" value={lead.company ?? ""} editing={editMode}>
                  <input
                    className={inputClass()}
                    value={form.company}
                    onChange={(event) =>
                      setForm({ ...form, company: event.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Value" value={`₹${lead.value}`} editing={editMode}>
                    <input
                      className={inputClass()}
                      type="number"
                      value={form.value}
                      onChange={(event) =>
                        setForm({ ...form, value: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Source" value={lead.source} editing={editMode}>
                    <select
                      className={inputClass()}
                      value={form.source}
                      onChange={(event) =>
                        setForm({ ...form, source: event.target.value })
                      }
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
                  </Field>
                </div>
                <Field label="Status" value={lead.status} editing={editMode}>
                  <select
                    className={inputClass()}
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    {["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON", "LOST"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  {allowReassign ? (
                    <Field
                      label="Assignee"
                      value={lead.assignee?.name ?? ""}
                      editing={editMode}
                    >
                      <select
                        className={inputClass()}
                        value={form.assignedTo}
                        onChange={(event) =>
                          setForm({ ...form, assignedTo: event.target.value })
                        }
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ) : null}
                  <Field
                    label="Follow-up"
                    value={
                      lead.followUpDate
                        ? new Date(lead.followUpDate).toLocaleString("en-IN")
                        : ""
                    }
                    editing={editMode}
                  >
                    <input
                      className={inputClass()}
                      type="datetime-local"
                      value={form.followUpDate}
                      onChange={(event) =>
                        setForm({ ...form, followUpDate: event.target.value })
                      }
                    />
                  </Field>
                </div>
                {editMode ? (
                  <Button
                    type="button"
                    fullWidth
                    loading={saving}
                    onClick={saveChanges}
                  >
                    Save changes
                  </Button>
                ) : null}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-heading text-base font-bold">AI Score</h3>
                  <Button type="button" loading={scoring} onClick={rescoreLead}>
                    Re-score with NEXA
                  </Button>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${lead.score}%`,
                      backgroundColor: scoreColor(lead.score),
                    }}
                  />
                </div>
                <p className="text-sm font-bold text-white">{lead.score}/100</p>
                <p className="text-sm leading-6 text-zinc-400">
                  {lead.scoreReason ?? "No score reason yet."}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="font-heading text-base font-bold">
                  Activity timeline
                </h3>
                <div className="space-y-4">
                  {sortedActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#7C6FFF]" />
                      <div>
                        <p className="text-xs font-bold uppercase text-[#b8b2ff]">
                          {activity.type}
                        </p>
                        <p className="mt-1 text-sm text-white">{activity.note}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {activity.user.name} • {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={logActivity} className="space-y-3">
                  <select
                    className={inputClass()}
                    value={activityType}
                    onChange={(event) => setActivityType(event.target.value)}
                  >
                    {["Call", "Email", "Meeting", "Note", "WhatsApp"].map(
                      (type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ),
                    )}
                  </select>
                  <textarea
                    className={inputClass()}
                    rows={3}
                    value={activityNote}
                    onChange={(event) => setActivityNote(event.target.value)}
                    placeholder="Write an update..."
                  />
                  <Button type="submit" loading={activityLoading}>
                    Log activity
                  </Button>
                </form>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-heading text-base font-bold">Reminders</h3>
                  <button
                    type="button"
                    onClick={() => setShowReminderForm((value) => !value)}
                    className="text-sm font-semibold text-[#7C6FFF]"
                  >
                    Set reminder
                  </button>
                </div>
                <div className="space-y-2">
                  {lead.reminders.length > 0 ? (
                    lead.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-xl border border-white/10 bg-[#13131c] p-3"
                      >
                        <p className="text-sm text-white">{reminder.message}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(reminder.dueAt).toLocaleString("en-IN")} •{" "}
                          {reminder.user.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">No reminders set.</p>
                  )}
                </div>
                {showReminderForm ? (
                  <form onSubmit={createReminder} className="space-y-3">
                    <input
                      className={inputClass()}
                      value={reminderMessage}
                      onChange={(event) => setReminderMessage(event.target.value)}
                      placeholder="Reminder message"
                    />
                    <input
                      className={inputClass()}
                      type="datetime-local"
                      value={reminderDueAt}
                      onChange={(event) => setReminderDueAt(event.target.value)}
                    />
                    <select
                      className={inputClass()}
                      value={reminderUserId}
                      onChange={(event) => setReminderUserId(event.target.value)}
                    >
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" loading={reminderLoading}>
                      Save reminder
                    </Button>
                  </form>
                ) : null}
              </section>

              <section className="rounded-xl border border-[#FF6B6B]/20 bg-[#FF6B6B]/5 p-4">
                <button
                  type="button"
                  onClick={() => setDangerOpen((value) => !value)}
                  className="text-sm font-bold text-[#FF6B6B]"
                >
                  Danger zone
                </button>
                {dangerOpen ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      className={inputClass()}
                      rows={3}
                      value={lostReason}
                      onChange={(event) => setLostReason(event.target.value)}
                      placeholder="Why was this lead lost?"
                    />
                    <Button
                      type="button"
                      loading={lostLoading}
                      onClick={markLost}
                      className="bg-[#FF6B6B] hover:bg-[#ee5d5d]"
                    >
                      Mark as Lost
                    </Button>
                  </div>
                ) : null}
              </section>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Lead not found.</p>
          )}
        </div>
      </aside>
    </>
  );
}
