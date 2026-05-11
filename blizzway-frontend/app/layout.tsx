import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blizzway | The Magical Career Pathway",
  description: "A premium AI career ecosystem for Learning Garden, Earning Universe, companions, credits, and guided growth.",
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
