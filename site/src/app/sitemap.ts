import type { MetadataRoute } from "next";

import { ARCADE_GAMES } from "@/content/arcade";
import { selectedSystems } from "@/content/site";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Pages that exist in both locales, as `[English path, Spanish path]`. Each pair
 * emits two entries that point at each other through `alternates.languages`, so
 * a crawler that finds either half learns the other exists.
 *
 * `/ana/debug` is deliberately absent: it is internal, `robots.txt` disallows
 * `/ana/`, and the page itself sends `robots: { index: false, follow: false }`.
 */
const PAIRED_PATHS: ReadonlyArray<readonly [string, string]> = [
  ["/", "/es"],
  ["/arcade", "/es/arcade"],
  ["/contact", "/es/contact"],
  ["/cosmos", "/es/cosmos"],
  ["/laboratory", "/es/laboratory"],
  ["/laboratory/codeancestry", "/es/laboratory/codeancestry"],
  ["/sound", "/es/sound"],
  ["/story", "/es/story"],
  ["/support", "/es/support"],
  ["/work", "/es/work"],
  ...ARCADE_GAMES.map(({ slug }) => [`/arcade/${slug}`, `/es/arcade/${slug}`] as const),
];

/**
 * Case studies render in English only — there is no `/es/work/[slug]` route — so
 * they carry no language alternates. The slugs come from `selectedSystems`, the
 * same list `generateStaticParams` builds the pages from, which is derived from
 * `siteContent.projects`; a slug here therefore always has a page behind it.
 */
const englishOnlyPaths = selectedSystems.map(({ slug }) => `/work/${slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const paired = PAIRED_PATHS.flatMap(([english, spanish]) => {
    const languages = { en: absoluteUrl(english), es: absoluteUrl(spanish) };
    return [
      { url: absoluteUrl(english), alternates: { languages } },
      { url: absoluteUrl(spanish), alternates: { languages } },
    ];
  });

  return [...paired, ...englishOnlyPaths.map((path) => ({ url: absoluteUrl(path) }))];
}
