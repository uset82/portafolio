/**
 * `NEXT_PUBLIC_SITE_URL` is already the approved origin for OpenRouter's
 * `HTTP-Referer` and the CACM AI origin allowlist, so canonical and Open Graph
 * URLs read that same variable rather than introducing a second source of
 * truth. Local runs set it to http://localhost:3000, which keeps dev previews
 * from advertising production URLs.
 *
 * Unlike `buildOpenRouterOptions`, this cannot throw on a malformed value: there
 * a bad variable fails one API call, but `metadataBase` and `sitemap` are read
 * during the build, so raising would take the whole deployment down. Anything
 * unparseable falls back to the production origin instead.
 */
const PRODUCTION_ORIGIN = "https://carloscarpio.dev";

const resolveSiteUrl = (value: string | undefined): URL => {
  const candidate = value?.trim();
  if (!candidate || !URL.canParse(candidate)) return new URL(PRODUCTION_ORIGIN);

  const url = new URL(candidate);
  const usable = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  return usable ? url : new URL(PRODUCTION_ORIGIN);
};

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const absoluteUrl = (path: string): string => new URL(path, siteUrl).toString();
