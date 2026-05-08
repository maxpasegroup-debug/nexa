import { Career7Badge } from "./Career7Badge";
import { cn } from "./utils";

type AgentAccent = "indigo" | "purple" | "cyan" | "emerald";

const accentClass: Record<AgentAccent, string> = {
  indigo: "from-indigo-500 to-purple-500",
  purple: "from-purple-500 to-fuchsia-500",
  cyan: "from-cyan-500 to-indigo-500",
  emerald: "from-emerald-500 to-cyan-500",
};

export type AgentAppCardProps = {
  name: string;
  category: string;
  description: string;
  score?: string | number;
  accent?: AgentAccent;
  href?: string;
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AgentAppCard({
  name,
  category,
  description,
  score,
  accent = "indigo",
  href = "/agent-store",
  className,
}: AgentAppCardProps) {
  return (
    <a href={href} className={cn("c7-companion-card block overflow-hidden p-4 transition hover:-translate-y-1", className)}>
      <div className={cn("rounded-[20px] bg-gradient-to-br p-5 text-white shadow-lg shadow-indigo-500/20", accentClass[accent])}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-sm font-black">
            {initials(name)}
          </span>
          {score ? (
            <span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-bold">{score}</span>
          ) : null}
        </div>
        <h3 className="mt-8 text-xl font-black tracking-tight">{name}</h3>
      </div>
      <div className="px-1 pt-4">
        <Career7Badge tone="slate">{category}</Career7Badge>
        <p className="mt-3 text-sm leading-6 c7-muted">{description}</p>
      </div>
    </a>
  );
}
