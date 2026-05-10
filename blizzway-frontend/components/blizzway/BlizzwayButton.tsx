import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "c7-button-primary",
  secondary: "c7-button-secondary",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-4 font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
  dark:
    "inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 text-xs",
  md: "min-h-11 text-sm",
  lg: "min-h-12 text-base",
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = SharedProps & {
  href: string;
  type?: never;
  onClick?: never;
};

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export type BlizzwayButtonProps = LinkButtonProps | NativeButtonProps;

export function BlizzwayButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: BlizzwayButtonProps) {
  const classes = cn(variantClass[variant], sizeClass[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
