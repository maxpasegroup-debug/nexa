"use client";

type LandingCtaButtonProps = {
  className: string;
};

declare global {
  interface Window {
    openNexaWidget?: () => void;
  }
}

export function LandingCtaButton({ className }: LandingCtaButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.openNexaWidget?.()}
      className={className}
    >
      Get a free BGOS setup
    </button>
  );
}
