import type { MetadataRoute } from "next";

/**
 * The Railway deployment is an unapproved preview, not an authorized production
 * launch (see `maintaskplan.md` Phase 8). Every page already sends
 * `<meta name="robots" content="noindex">`, but `/robots.txt` did not exist and
 * resolved to the 404 page, so crawlers received no directive at the origin level.
 *
 * Disallow everything until production launch is approved. At that point this file
 * becomes the place to allow crawling and declare the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/", "/ana/"],
      },
    ],
  };
}
