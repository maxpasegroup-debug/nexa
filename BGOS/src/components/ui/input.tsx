import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(clsx(classes));
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full space-y-2">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-200"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-zinc-800 bg-[#0e0e13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
