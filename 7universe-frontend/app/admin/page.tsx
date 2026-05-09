import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");

  if (password && password === process.env.ADMIN_PASSWORD) {
    cookies().set("universe_admin", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
    });
    redirect("/admin");
  }

  redirect("/admin?error=1");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const isAuthed = cookies().get("universe_admin")?.value === "true";

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 text-white">
        <form action={login} className="w-full max-w-sm rounded-[20px] border border-[rgba(245,158,11,0.15)] bg-[#0a0a14] p-7">
          <h1 className="font-heading text-2xl font-extrabold text-[#F59E0B]">7Universe Admin</h1>
          <input
            name="password"
            type="password"
            placeholder="Admin password"
            className="mt-6 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-4 outline-none placeholder:text-white/30"
          />
          {searchParams.error ? <p className="mt-3 text-sm text-amber-300">Wrong password.</p> : null}
          <button className="mt-5 w-full rounded-xl bg-[#F59E0B] px-4 py-4 font-extrabold text-black">
            Continue
          </button>
        </form>
      </main>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, todaySignups, progressRows] = await Promise.all([
    prisma.universeUser.count(),
    prisma.universeUser.count({ where: { createdAt: { gte: today } } }),
    prisma.universeProgress.groupBy({
      by: ["stepNumber"],
      _count: { stepNumber: true },
      orderBy: { stepNumber: "asc" },
    }),
  ]);
  const stepCounts = [1, 2, 3, 4, 5].map((step) => ({
    step,
    count: progressRows.find((row) => row.stepNumber === step)?._count.stepNumber ?? 0,
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d0020_0%,#000000_100%)] px-5 py-7 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-sm font-extrabold text-[#F59E0B]">7Universe</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold">Admin Overview</h1>
          </div>
          <a href="/admin/users" className="rounded-xl bg-[#F59E0B] px-4 py-3 font-extrabold text-black">
            Users
          </a>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/50">Total users</p>
            <p className="mt-2 text-4xl font-extrabold">{totalUsers}</p>
          </div>
          <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/50">Today signups</p>
            <p className="mt-2 text-4xl font-extrabold">{todaySignups}</p>
          </div>
        </section>

        <section className="mt-6 rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-heading text-xl font-extrabold">Funnel</h2>
          <p className="mt-4 text-white/70">
            {stepCounts.map((item) => `Step ${item.step}: ${item.count}`).join(" · ")}
          </p>
          <div className="mt-5 grid gap-3">
            {stepCounts.slice(1).map((item, index) => {
              const previous = stepCounts[index].count;
              const dropOff = previous ? Math.round(((previous - item.count) / previous) * 100) : 0;

              return (
                <div key={item.step} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm">
                  <span>
                    Step {item.step - 1} → Step {item.step}
                  </span>
                  <span className="font-bold text-[#F59E0B]">{dropOff}% drop-off</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

