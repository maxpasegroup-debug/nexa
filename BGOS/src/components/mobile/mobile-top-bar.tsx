"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type MobileTopBarProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
};

export function MobileTopBar({ title, subtitle, showBack = false, rightAction }: MobileTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-white/[0.07] bg-[rgba(7,7,9,0.97)] px-4 backdrop-blur-xl md:hidden">
      <div className="flex min-w-0 items-center gap-3">
        {showBack ? (
          <button type="button" onClick={() => router.back()} className="touch-target -ml-2 flex items-center justify-center text-white" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate font-heading text-[15px] font-extrabold text-white">{title}</h1>
          {subtitle ? <p className="truncate text-[10px] font-bold text-[#22D9A0]">{subtitle}</p> : null}
        </div>
      </div>
      {rightAction ?? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7C6FFF] font-heading text-xs font-extrabold text-white">
          U
        </div>
      )}
    </header>
  );
}
