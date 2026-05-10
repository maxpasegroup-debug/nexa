import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export type BlizzwayGradientPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
};

export function BlizzwayGradientPanel({
  children,
  padded = true,
  className,
  ...props
}: BlizzwayGradientPanelProps) {
  return (
    <div
      className={cn(
        "c7-gradient-panel min-w-0 max-w-[calc(100vw-2rem)] rounded-[28px] shadow-2xl shadow-indigo-500/20 md:max-w-none",
        padded && "p-5 sm:p-6 lg:p-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
