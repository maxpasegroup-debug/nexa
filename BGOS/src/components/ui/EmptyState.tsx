import Link from "next/link";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-4xl">📭</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-white/60">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
