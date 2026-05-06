import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/components/auth/session-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "BGOS - AI Operating System for growing businesses",
  description:
    "BGOS helps growing business owners manage leads, team tasks, follow-ups, inboxes, and daily AI recommendations from one operating dashboard.",
  keywords:
    "AI CRM, business automation, SME software, lead management, WhatsApp CRM",
  openGraph: {
    title: "BGOS - AI Operating System for growing businesses",
    description:
      "CRM, team tasks, follow-ups, inboxes, and AI recommendations - built for growing businesses.",
    url: "https://your-railway-domain.up.railway.app",
    siteName: "BGOS",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BGOS - AI Operating System for growing businesses",
    description: "CRM, team tasks, follow-ups, inboxes, and AI recommendations for growing businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BGOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BGOS" />
        <link rel="apple-touch-icon" href="/images/nexa.jpeg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  }
`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#070709] font-sans text-white antialiased">
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
