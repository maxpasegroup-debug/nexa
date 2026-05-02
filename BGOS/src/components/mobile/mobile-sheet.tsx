"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type MobileSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  height?: "half" | "full" | "auto";
};

const heightClass: Record<NonNullable<MobileSheetProps["height"]>, string> = {
  half: "h-[50vh]",
  full: "h-[92vh]",
  auto: "max-h-[88vh]",
};

export function MobileSheet({ isOpen, onClose, title, children, height = "auto" }: MobileSheetProps) {
  return (
    <div className={`fixed inset-0 z-[9999] md:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close sheet"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <section
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/[0.08] bg-[#0f0f14] pb-safe text-white shadow-2xl transition-transform duration-300 ${heightClass[height]} ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-[#6B6878]" />
        </div>
        <header className="flex items-center justify-between px-5 py-4">
          <h2 className="font-heading text-base font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} className="touch-target flex items-center justify-center rounded-xl border border-white/[0.08] text-[#6B6878]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="scroll-smooth-ios max-h-[calc(100%-76px)] overflow-y-auto px-5 pb-5">
          {children}
        </div>
      </section>
    </div>
  );
}
