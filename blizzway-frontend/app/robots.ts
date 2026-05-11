import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://career7.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/login",
        "/signup",
        "/forgot-password",
        "/dashboard",
        "/bdp",
        "/wallet",
        "/settings",
        "/soul-vault",
        "/onboarding",
        "/my-pathway",
        "/growth-board",
        "/companions",
        "/assessments",
        "/admissions",
        "/career-tests",
        "/magic-market",
      ],
    },
    sitemap: `${siteUrl.replace(/\/+$/, "")}/sitemap.xml`,
    host: siteUrl.replace(/\/+$/, ""),
  };
}
