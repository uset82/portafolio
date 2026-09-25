import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { resolveSiteUrl } from "../src/lib/site-url";

/**
 * Published metadata is the one contract no unit test can see: it exists only
 * after `next build` resolves `metadataBase`, and it fails silently. Two live
 * defects motivated this gate. Every English page inherited the layout's
 * `canonical: "/"` and so declared itself the homepage, which survived months
 * of green builds. Then a stale `NEXT_PUBLIC_SITE_URL` published a sitemap of
 * 123 preview-host URLs alongside a freshly opened `Allow: /`, inviting
 * crawlers to index the site under the wrong domain.
 *
 * Both shipped through `verify:prebuild` untouched. This runs after the build,
 * beside `immersive:check`, and reads what was actually written to disk.
 *
 * Patterns here are built from strings rather than regex literals so that no
 * character class depends on a backslash surviving; an escape silently lost in
 * a shell heredoc once turned this gate's own directive check into a no-op.
 */
const siteRoot = process.cwd();
const appBuildRoot = path.join(siteRoot, ".next/server/app");

/** Error routes carry no canonical and belong in no sitemap. */
const NON_ROUTE_PAGES = new Set(["_not-found", "_global-error"]);

/** Routes `robots.txt` closes, which must therefore stay out of the sitemap. */
const DISALLOWED_PREFIXES = ["/ana/", "/api/"] as const;

const canonicalOrigin = resolveSiteUrl({ NODE_ENV: "production" }).origin;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : Promise.resolve([entryPath]);
    }),
  );
  return files.flat();
}

/** `.next/server/app/es/arcade/tetris.html` -> `/es/arcade/tetris`; `index.html` -> `/`. */
const routeForOutputFile = (file: string) => {
  const relative = path.relative(appBuildRoot, file).split(path.sep).join("/");
  const withoutExtension = relative.slice(0, -".html".length);
  return withoutExtension === "index" ? "/" : `/${withoutExtension}`;
};

/** `/work/` and `/work` name one route; compare them as one. */
const normalizeRoute = (route: string) =>
  route.length > 1 && route.endsWith("/") ? route.slice(0, -1) : route;

const matchAll = (source: string, pattern: string) => [...source.matchAll(new RegExp(pattern, "g"))];

const readBuildArtifact = async (relativePath: string, description: string) => {
  try {
    return await readFile(path.join(appBuildRoot, relativePath), "utf8");
  } catch {
    throw new Error(
      `${description} is missing from the build at ${relativePath}. Run \`pnpm build\` first, and make sure no \`next dev\` server is overwriting .next.`,
    );
  }
};

const assertCanonicalOrigin = (url: string, subject: string) => {
  invariant(
    URL.canParse(url),
    `${subject} must be an absolute URL, but published "${url}". A relative value means \`metadataBase\` is unset.`,
  );
  invariant(
    new URL(url).origin === canonicalOrigin,
    `${subject} published "${url}", which is not on ${canonicalOrigin}. Published metadata must never name another host.`,
  );
};

async function validateRobots() {
  const robots = await readBuildArtifact("robots.txt.body", "robots.txt");
  const directives = robots.split("\n").map((line) => line.trim());

  const sitemapDirective = directives.find((line) => line.startsWith("Sitemap:"));
  invariant(sitemapDirective, "robots.txt must declare a Sitemap so crawlers can find every route.");
  assertCanonicalOrigin(
    sitemapDirective.slice("Sitemap:".length).trim(),
    "The robots.txt Sitemap declaration",
  );

  for (const prefix of DISALLOWED_PREFIXES) {
    invariant(
      directives.includes(`Disallow: ${prefix}`),
      `robots.txt must keep ${prefix} closed; those routes answer the application, not a reader.`,
    );
  }
}

async function validateSitemap() {
  const sitemap = await readBuildArtifact("sitemap.xml.body", "sitemap.xml");

  const locations = matchAll(sitemap, "<loc>([^<]+)</loc>").map(([, url]) => url ?? "");
  invariant(locations.length > 0, "The sitemap published no URLs.");

  for (const location of locations) assertCanonicalOrigin(location, "A sitemap <loc>");

  for (const [, language, href] of matchAll(sitemap, 'hreflang="([^"]+)"[^>]*href="([^"]+)"')) {
    assertCanonicalOrigin(href ?? "", `The ${language} hreflang alternate`);
  }

  const duplicate = locations.find((url, index) => locations.indexOf(url) !== index);
  invariant(
    !duplicate,
    `The sitemap lists ${duplicate} more than once; each route must appear exactly once.`,
  );

  const routes = locations.map((location) => normalizeRoute(new URL(location).pathname));

  for (const route of routes) {
    for (const prefix of DISALLOWED_PREFIXES) {
      invariant(
        !route.startsWith(prefix),
        `The sitemap lists ${route}, which robots.txt disallows. A closed route must not be advertised.`,
      );
    }
  }

  return new Set(routes);
}

async function validateCanonicals(sitemapRoutes: ReadonlySet<string>) {
  const pages = (await collectFiles(appBuildRoot))
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !NON_ROUTE_PAGES.has(path.basename(file, ".html")))
    .filter((file) => !DISALLOWED_PREFIXES.some((p) => routeForOutputFile(file).startsWith(p)));

  invariant(
    pages.length > 0,
    "The build published no prerendered routes to check. A `next dev` server may have replaced the production build in .next.",
  );

  for (const page of pages) {
    const route = routeForOutputFile(page);
    const markup = await readFile(page, "utf8");
    const canonicals = matchAll(markup, '<link rel="canonical" href="([^"]+)"').map(
      ([, href]) => href ?? "",
    );

    invariant(
      canonicals.length === 1,
      `${route} published ${canonicals.length} canonical links; exactly one is required.`,
    );

    const canonical = canonicals[0] ?? "";
    assertCanonicalOrigin(canonical, `The canonical link on ${route}`);

    /* The defect this gate exists for: a page that declares no `alternates`
     * inherits its layout's, so every route silently canonicalizes to the
     * locale root and asks search engines to drop it in favour of that root. */
    invariant(
      normalizeRoute(new URL(canonical).pathname) === route,
      `${route} canonicalizes to ${new URL(canonical).pathname}. A page that declares no \`alternates\` inherits its layout's canonical, which tells search engines to drop it.`,
    );

    invariant(
      sitemapRoutes.has(route),
      `${route} is published and indexable but absent from the sitemap.`,
    );
  }

  const publishedRoutes = new Set(pages.map(routeForOutputFile));
  for (const route of sitemapRoutes) {
    invariant(
      publishedRoutes.has(route),
      `The sitemap advertises ${route}, which the build did not publish.`,
    );
  }

  return pages.length;
}

async function main() {
  await validateRobots();
  const sitemapRoutes = await validateSitemap();
  const pages = await validateCanonicals(sitemapRoutes);
  console.log(
    `Published metadata valid: ${pages} routes canonicalize to themselves on ${canonicalOrigin}, each listed once in a sitemap of ${sitemapRoutes.size} URLs.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The published metadata gate failed.");
  process.exitCode = 1;
});
