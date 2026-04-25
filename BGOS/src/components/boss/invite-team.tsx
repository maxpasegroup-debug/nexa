"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InviteRole = "BDM" | "SDE";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "BOSS" | "BDM" | "SDE" | "ADMIN";
  createdAt: string;
};

type InviteTeamProps = {
  showMembers?: boolean;
  onInviteSent?: () => void;
};

export function InviteTeam({
  showMembers = true,
  onInviteSent,
}: InviteTeamProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("BDM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  async function loadMembers() {
    setMembersLoading(true);

    const response = await fetch("/api/team", {
      cache: "no-store",
    });

    setMembersLoading(false);

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { users: TeamMember[] };
    setMembers(data.users);
  }

  useEffect(() => {
    void loadMembers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/onboarding/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, role }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Unable to send invite.");
      return;
    }

    setSuccess(`Invite sent to ${email}`);
    setIsOpen(false);
    setName("");
    setEmail("");
    setRole("BDM");
    void loadMembers();
    onInviteSent?.();
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#13131c] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold">Your team</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Add BDMs and SDEs to your business HQ.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6b60e8]"
        >
          <UserPlus className="h-4 w-4" />
          Invite team member
        </button>
      </div>

      {success ? (
        <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </p>
      ) : null}

      {isOpen ? (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              name="inviteName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Team member name"
            />
            <Input
              label="Email"
              name="inviteEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="inviteRole"
              className="block text-sm font-medium text-zinc-200"
            >
              Role
            </label>
            <select
              id="inviteRole"
              value={role}
              onChange={(event) => setRole(event.target.value as InviteRole)}
              className="w-full rounded-xl border border-zinc-800 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
            >
              <option value="BDM">BDM</option>
              <option value="SDE">SDE</option>
            </select>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" loading={loading}>
            Send Invite
          </Button>
        </form>
      ) : null}

      {showMembers ? (
      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-sm font-semibold uppercase text-zinc-500">
          Current members
        </h3>
        {membersLoading ? (
          <p className="mt-4 text-sm text-zinc-400">Loading team...</p>
        ) : members.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0e0e13] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {member.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-[#7C6FFF]/30 bg-[#7C6FFF]/10 px-3 py-1 text-xs font-semibold text-[#c6c1ff]">
                    {member.role}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Joined{" "}
                    {new Date(member.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">
            No team members have joined yet.
          </p>
        )}
      </div>
      ) : null}
    </section>
  );
}
