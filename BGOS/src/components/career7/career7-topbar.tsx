"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

type Career7TopbarProps = {
  title?: string;
  subtitle?: string;
  userName?: string;
};

export function Career7Topbar({
  title = "Good Morning, Arjun!",
  subtitle = "Let's build your dream career today.",
  userName = "Arjun Verma",
}: Career7TopbarProps) {
  return (
    <header className="bg-[#f8f9fd] px-5 pt-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-[#101633]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-5">
          <label className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search agents, tools, programs..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <button className="relative rounded-xl p-2 text-[#101633] transition-colors hover:bg-white" aria-label="Notifications">
            <Bell size={21} />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 to-blue-600 text-sm font-bold text-white">
              AV
            </div>
            <span className="hidden text-sm font-medium text-[#101633] sm:inline">{userName}</span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
