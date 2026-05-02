import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BGOS - AI Operating System for Indian SMEs",
  description:
    "BGOS helps Indian SME owners manage leads, team tasks, follow-ups, inboxes, and daily AI recommendations from one operating dashboard.",
  keywords:
    "AI CRM India, business automation India, SME software India, lead management India, WhatsApp CRM",
  openGraph: {
    title: "BGOS - AI Operating System for Indian SMEs",
    description:
      "CRM, team tasks, follow-ups, inboxes, and AI recommendations - built for Indian SMEs.",
    url: "https://your-railway-domain.up.railway.app",
    siteName: "BGOS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BGOS - AI Operating System for Indian SMEs",
    description: "CRM, team tasks, follow-ups, inboxes, and AI recommendations for Indian SMEs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#070709] font-sans text-white antialiased">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
