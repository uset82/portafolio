import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

/**
 * The site now serves its approved production origin, https://carloscarpio.dev,
 * so the blanket disallow that guarded the unapproved Railway preview is lifted.
 *
 * `/ana/` stays closed: it is the internal Ana surface, and `/ana/debug` already
 * sends `robots: { index: false, follow: false }`. `/api/` is closed for the same
 * reason — those routes answer the application, not a reader.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ana/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
