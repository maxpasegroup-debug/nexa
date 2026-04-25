"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConnectGmailBanner } from "@/components/inbox/connect-gmail-banner";
import { InboxLayout } from "@/components/inbox/inbox-layout";

type InboxPageProps = {
  isConnected: boolean;
  businessId: string;
};

function GmailConnectedToast({ onDone }: { onDone: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (handled.current) return;
    if (searchParams.get("connected") === "true") {
      handled.current = true;
      setVisible(true);
      router.replace("/boss/inbox");
      const timer = window.setTimeout(() => setVisible(false), 5000);
      return () => window.clearTimeout(timer);
    }
    onDone();
  }, [searchParams, router, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed right-5 top-5 z-[100] rounded-xl border border-[#22D9A0]/30 bg-[#22D9A0]/10 px-5 py-3.5 text-sm font-semibold text-[#d8fff3] shadow-2xl shadow-black/30">
      Gmail connected successfully. NEXA is syncing your emails.
    </div>
  );
}

export function InboxPage({ isConnected, businessId }: InboxPageProps) {
  return (
    <>
      <Suspense>
        <GmailConnectedToast onDone={() => undefined} />
      </Suspense>

      {isConnected ? (
        <InboxLayout businessId={businessId} />
      ) : (
        <div className="relative">
          <div className="pointer-events-none select-none opacity-25">
            <InboxLayout businessId={businessId} disabled />
          </div>
          <div className="absolute inset-0 flex items-start justify-center pt-24 px-6">
            <div className="w-full max-w-2xl">
              <ConnectGmailBanner />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
