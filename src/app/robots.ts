import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fintrak.one";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/api/", "/dashboard"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
