import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blizzway.com";
const siteName = "Blizzway";
const description =
  "Blizzway is The Magical Career Pathway: an AI-guided career ecosystem for students, professionals, and aspirants.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Blizzway | The Magical Career Pathway",
    template: "%s | Blizzway",
  },
  description,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Blizzway",
    "career pathway",
    "AI career guidance",
    "career planning",
    "student career guidance",
    "NEXA",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: "Blizzway | The Magical Career Pathway",
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Blizzway career pathway dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blizzway | The Magical Career Pathway",
    description,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
