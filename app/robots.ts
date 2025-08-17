import { MetadataRoute } from "next";

// Static generation configuration for Cloudflare Pages
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/admin/"],
    },
    sitemap: "https://gonoblelane.com/sitemap.xml",
  };
}
