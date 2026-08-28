/**
 * The canonical origin of the launched site. This is a fact, not configuration:
 * `metadataBase`, the sitemap, and every canonical tag must agree on one origin
 * or search engines resolve the disagreement by dropping pages.
 *
 * Production therefore ignores `NEXT_PUBLIC_SITE_URL` entirely. `next build`
 * sets `NODE_ENV=production`, so a deployment cannot silently start advertising
 * a preview host because a dashboard variable was reverted or never updated —
 * a failure that ships green and only surfaces once pages leave the index. It
 * also means a preview deployment canonicalizes to production rather than
 * competing with it for the same content.
 *
 * Outside production the variable is honoured, so `next dev` keeps advertising
 * http://localhost:3000 instead of the live domain. Unlike
 * `buildOpenRouterOptions`, an unusable value cannot throw here: metadata is
 * read during the build, so raising would take the whole deployment down.
 */
const PRODUCTION_ORIGIN = "https://carloscarpio.dev";

export type SiteUrlEnvironment = {
  NODE_ENV?: string | undefined;
  NEXT_PUBLIC_SITE_URL?: string | undefined;
};

export const resolveSiteUrl = (environment: SiteUrlEnvironment): URL => {
  if (environment.NODE_ENV === "production") return new URL(PRODUCTION_ORIGIN);

  const candidate = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (!candidate || !URL.canParse(candidate)) return new URL(PRODUCTION_ORIGIN);

  const url = new URL(candidate);
  const usable = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  return usable ? url : new URL(PRODUCTION_ORIGIN);
};

export const siteUrl = resolveSiteUrl({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const absoluteUrl = (path: string): string => new URL(path, siteUrl).toString();
