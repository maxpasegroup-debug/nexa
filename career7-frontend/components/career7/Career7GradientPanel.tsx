import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export type Career7GradientPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
};

export function Career7GradientPanel({
  children,
  padded = true,
  className,
  ...props
}: Career7GradientPanelProps) {
  return (
    <div
      className={cn(
        "c7-gradient-panel rounded-[28px] shadow-2xl shadow-indigo-500/20",
        padded && "p-5 sm:p-6 lg:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
