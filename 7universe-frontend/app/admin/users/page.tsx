import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    step?: string;
    from?: string;
    to?: string;
  };
}) {
  if (cookies().get("universe_admin")?.value !== "true") {
    redirect("/admin");
  }

  const q = searchParams.q?.trim();
  const step = Number(searchParams.step);
  const from = parseDate(searchParams.from);
  const to = parseDate(searchParams.to);

  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  const users = await prisma.universeUser.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(Number.isInteger(step) && step >= 1 && step <= 5
        ? { progress: { some: { stepNumber: step } } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { progress: { select: { stepNumber: true } } },
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-4 py-7 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-bold text-[#F59E0B]">
              ← Overview
            </Link>
            <h1 className="mt-2 font-heading text-3xl font-extrabold">Users</h1>
          </div>
        </header>

        <form className="mt-7 grid gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search name or phone"
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 outline-none placeholder:text-white/30"
          />
          <select
            name="step"
            defaultValue={searchParams.step ?? ""}
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 outline-none"
          >
            <option className="bg-[#0a0a14]" value="">
              Any step
            </option>
            {[1, 2, 3, 4, 5].map((item) => (
              <option className="bg-[#0a0a14]" key={item} value={item}>
                Completed step {item}
              </option>
            ))}
          </select>
          <input
            name="from"
            type="date"
            defaultValue={searchParams.from}
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 outline-none"
          />
          <input
            name="to"
            type="date"
            defaultValue={searchParams.to}
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 outline-none"
          />
          <button className="rounded-xl bg-[#F59E0B] px-4 py-3 font-extrabold text-black md:col-span-4">
            Filter
          </button>
        </form>

        <section className="mt-6 overflow-x-auto rounded-[14px] border border-white/10 bg-white/[0.03]">
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <thead className="bg-black/30 text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Steps done</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Referred by</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-4 font-bold">{user.name}</td>
                  <td className="px-4 py-4 text-white/70">{user.phone}</td>
                  <td className="px-4 py-4 text-white/70">{user.language}</td>
                  <td className="px-4 py-4 text-[#F59E0B]">{user.progress.length}/5</td>
                  <td className="px-4 py-4 text-white/70">{user.createdAt.toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-4 text-white/70">{user.referredBy ?? "-"}</td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/45">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

