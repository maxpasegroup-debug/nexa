"use client";

import { useEffect, useMemo, useState } from "react";

type HealthScoreProps = {
  score: number;
  previousScore?: number;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function getScoreStyle(score: number) {
  if (score <= 40) {
    return {
      color: "#FF6B6B",
      message: "Needs immediate attention",
    };
  }

  if (score <= 70) {
    return {
      color: "#F5A623",
      message: "Growing steadily",
    };
  }

  return {
    color: "#22D9A0",
    message: "Business is thriving",
  };
}

export function HealthScore({ score, previousScore }: HealthScoreProps) {
  const [mounted, setMounted] = useState(false);
  const normalizedScore = clampScore(score);
  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const style = getScoreStyle(normalizedScore);
  const strokeDashoffset = mounted
    ? circumference - (normalizedScore / 100) * circumference
    : circumference;
  const delta = useMemo(() => {
    if (typeof previousScore !== "number" || previousScore === score) {
      return null;
    }

    return score - previousScore;
  }, [previousScore, score]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[184px] w-[184px]">
        <svg
          className="-rotate-90"
          width="184"
          height="184"
          viewBox="0 0 184 184"
          aria-label={`Business health score ${normalizedScore} out of 100`}
        >
          <circle
            cx="92"
            cy="92"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="92"
            cy="92"
            r={radius}
            fill="none"
            stroke={style.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-[1500ms] ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-[40px] font-bold leading-none text-white">
            {normalizedScore}
          </span>
          <span className="mt-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
            Health
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <p className="text-sm font-semibold" style={{ color: style.color }}>
          {style.message}
        </p>
        {delta ? (
          <span
            className="rounded-full border px-2 py-0.5 text-xs font-bold"
            style={{
              color: delta > 0 ? "#22D9A0" : "#FF6B6B",
              borderColor:
                delta > 0
                  ? "rgba(34,217,160,0.35)"
                  : "rgba(255,107,107,0.35)",
              backgroundColor:
                delta > 0
                  ? "rgba(34,217,160,0.1)"
                  : "rgba(255,107,107,0.1)",
            }}
          >
            {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}
