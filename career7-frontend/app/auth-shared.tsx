import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  sideTitle: string;
  sideDescription: string;
  highlights: string[];
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  sideTitle,
  sideDescription,
  highlights,
}: AuthShellProps) {
  return (
    <main className="c7-shell grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <section className="c7-sidebar hidden min-h-screen flex-col justify-between p-8 lg:flex">
        <Link href="/" className="flex items-center gap-3" aria-label="Career7 home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-indigo-600">
            C7
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-white">Career7</span>
            <span className="block text-xs font-semibold text-white/45">AI Career OS</span>
          </span>
        </Link>

        <div className="max-w-lg">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            {eyebrow}
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white">{sideTitle}</h1>
          <p className="mt-5 text-lg leading-8 text-white/66">{sideDescription}</p>
          <div className="mt-8 grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/45">Secure placeholder experience. Real auth arrives later.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-3" aria-label="Career7 home">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">
                C7
              </span>
              <span className="text-base font-black text-slate-950">Career7</span>
            </Link>
            <span className="c7-badge">Preview</span>
          </div>

          <div className="c7-card p-5 sm:p-7">
            <span className="c7-badge">{eyebrow}</span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
            <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function TextField({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}
