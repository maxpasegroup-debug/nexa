"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

type Trend = {
  direction: "up" | "down";
  value: number;
};

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: Trend;
  loading?: boolean;
};

function getNumericValue(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const numeric = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatAnimatedValue(originalValue: string | number, animated: number) {
  if (typeof originalValue === "number") {
    return Number.isInteger(originalValue)
      ? Math.round(animated).toLocaleString()
      : animated.toFixed(1);
  }

  const prefix = originalValue.match(/^[^\d-]+/)?.[0] ?? "";
  const suffix = originalValue.match(/[^\d.]+$/)?.[0] ?? "";
  const hasDecimal = originalValue.includes(".");
  const formatted = hasDecimal ? animated.toFixed(1) : Math.round(animated);

  return `${prefix}${formatted.toLocaleString()}${suffix}`;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
}: MetricCardProps) {
  const numericValue = useMemo(() => getNumericValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(
    numericValue === null ? value : 0,
  );

  useEffect(() => {
    if (loading || numericValue === null) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    const frames = 40;
    const interval = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / frames, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = numericValue * easedProgress;
      setDisplayValue(formatAnimatedValue(value, nextValue));

      if (progress >= 1) {
        window.clearInterval(interval);
      }
    }, 25);

    return () => window.clearInterval(interval);
  }, [loading, numericValue, value]);

  if (loading) {
    return (
      <div className="metric-skeleton h-[148px] rounded-xl border border-white/10 bg-[#13131c] p-5">
        <div className="h-5 w-28 rounded-md" />
        <div className="mt-6 h-9 w-32 rounded-md" />
        <div className="mt-5 h-4 w-40 rounded-md" />
        <style jsx>{`
          .metric-skeleton div {
            animation: metricShimmer 1.2s ease-in-out infinite alternate;
            background: rgba(255, 255, 255, 0.05);
          }

          @keyframes metricShimmer {
            from {
              background: rgba(255, 255, 255, 0.05);
            }

            to {
              background: rgba(255, 255, 255, 0.1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#13131c] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C6FFF]/15 text-[#9f97ff]">
          {icon}
        </div>
        <p className="text-xs font-semibold uppercase text-zinc-500">{title}</p>
      </div>
      <p className="mt-5 font-heading text-[32px] font-bold leading-none text-white">
        {displayValue}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {subtitle ? <p className="text-xs text-zinc-500">{subtitle}</p> : null}
        {trend ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              trend.direction === "up"
                ? "bg-[#22D9A0]/10 text-[#22D9A0]"
                : "bg-[#FF6B6B]/10 text-[#FF6B6B]"
            }`}
          >
            {trend.direction === "up" ? "▲" : "▼"} {trend.value}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
