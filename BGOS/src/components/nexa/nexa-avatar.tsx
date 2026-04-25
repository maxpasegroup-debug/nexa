import { clsx } from "clsx";

type NexaAvatarProps = {
  size?: "sm" | "md";
};

export function NexaAvatar({ size = "md" }: NexaAvatarProps) {
  const dimensions = size === "sm" ? "h-8 w-8 text-sm" : "h-12 w-12 text-xl";
  const pulseSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading font-bold text-white shadow-[0_0_32px_rgba(124,111,255,0.35)]",
        dimensions,
      )}
    >
      N
      <span
        className={clsx(
          "absolute bottom-0 right-0 rounded-full border-2 border-[#070709] bg-[#22D9A0]",
          pulseSize,
        )}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#22D9A0] opacity-70" />
      </span>
    </div>
  );
}
