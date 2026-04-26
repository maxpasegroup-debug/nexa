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
  title: "BGOS — AI Operating System for Indian SMEs",
  description:
    "NEXA, your AI CEO, manages your sales team, tracks every lead, and runs your business on autopilot. Built for Indian businesses with 5 to 50 employees.",
  keywords:
    "AI CRM India, business automation India, AI CEO, SME software India, lead management India, WhatsApp CRM",
  openGraph: {
    title: "BGOS — AI Operating System for Indian SMEs",
    description:
      "NEXA manages your team so you don't have to. CRM, automation, and AI agents — built for Indian SMEs.",
    url: "https://your-railway-domain.up.railway.app",
    siteName: "BGOS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BGOS — AI Operating System for Indian SMEs",
    description: "NEXA manages your team so you don't have to.",
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
