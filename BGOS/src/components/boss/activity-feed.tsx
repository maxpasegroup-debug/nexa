"use client";

import { EmptyState } from "@/components/ui/EmptyState";

type Activity = {
  id: string;
  action: string;
  entity: string;
  createdAt: string | Date;
  user: {
    name: string;
    role: string;
  };
};

type ActivityFeedProps = {
  activities: Activity[];
};

function entityColor(entity: string) {
  if (entity === "Lead") {
    return "#7C6FFF";
  }

  if (entity === "Task") {
    return "#22D9A0";
  }

  if (entity === "User") {
    return "#F5A623";
  }

  return "#7C6FFF";
}

function timeAgo(createdAt: string | Date) {
  const created = new Date(createdAt).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - created) / 1000));

  if (diffSeconds < 60) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const visibleActivities = activities.slice(0, 10);

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No recent activity yet"
        description="Start by adding a lead or onboarding a client."
        action={{ label: "Add a lead", href: "/boss/leads" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {visibleActivities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="mt-1.5 flex w-4 justify-center">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entityColor(activity.entity) }}
              />
            </div>
            <div className="min-w-0 flex-1 border-b border-white/10 pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white">
                    {activity.user.name}
                    <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                      {activity.user.role}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-400">
                    {activity.action}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-zinc-500">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activities.length > 10 ? (
        <a
          href="#"
          className="inline-flex text-sm font-semibold text-[#7C6FFF] transition hover:text-[#9f97ff]"
        >
          View all activity
        </a>
      ) : null}
    </div>
  );
}

export type { Activity };
