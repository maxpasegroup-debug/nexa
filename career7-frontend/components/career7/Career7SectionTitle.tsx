import type { ReactNode } from "react";

import { cn } from "./utils";

type Align = "left" | "center";

export type Career7SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: Align;
  className?: string;
};

export function Career7SectionTitle({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: Career7SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "mx-auto max-w-2xl text-center sm:block",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
        {description ? <p className="mt-4 max-w-2xl text-base leading-7 c7-muted">{description}</p> : null}
      </div>
      {action ? <div className={cn(align === "center" && "mt-5")}>{action}</div> : null}
    </div>
  );
}
