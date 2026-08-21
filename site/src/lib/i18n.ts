/**
 * Locale plumbing for the bilingual site.
 *
 * English keeps the unprefixed routes it has always had, so every link that
 * exists in the wild still resolves. Spanish lives under `/es`, which means a
 * Spanish reader can be sent a URL rather than a page plus instructions for
 * finding the language switch.
 *
 * The two trees are route groups, `(en)` and `(es)`, so each one owns a root
 * layout and can declare its own `lang` on the document.
 */

export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** English is unprefixed: it is the language the routes were written in. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  es: "/es",
};

/** The `lang` attribute and the `hreflang` value for each locale. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en",
  es: "es",
};

/** What the other language calls itself, for the switch in the header. */
export const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Rewrites an internal href into `locale`. External URLs, mail links and bare
 * fragments are returned untouched, so callers can pass any href from content
 * without first asking what kind it is.
 */
export function localeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;

  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return href;
  if (href === "/") return prefix;
  return `${prefix}${href}`;
}

/** Splits a pathname into the locale it belongs to and its unprefixed path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (!prefix) continue;
    if (pathname === prefix) return { locale, path: "/" };
    if (pathname.startsWith(`${prefix}/`)) return { locale, path: pathname.slice(prefix.length) };
  }

  return { locale: DEFAULT_LOCALE, path: pathname };
}

/**
 * The routes that exist in both languages.
 *
 * Spanish is being rolled out route by route, and a language switch that lands
 * a reader on a 404 is worse than no switch at all, so the header only offers
 * the change where the counterpart is really there. Dynamic segments are
 * matched by their prefix: `/arcade/` covers every game page.
 */
const TRANSLATED_EXACT = new Set<string>(["/", "/arcade"]);
const TRANSLATED_PREFIXES: readonly string[] = ["/arcade/"];

export function hasTranslation(pathname: string): boolean {
  const { path } = splitLocale(pathname);
  if (TRANSLATED_EXACT.has(path)) return true;
  return TRANSLATED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * The href to use for an internal link while a Spanish page is rendering.
 *
 * A Spanish page linking to a route that has no Spanish version yet sends the
 * reader to the English one rather than to a 404. That is a visible seam, and
 * the honest one: the page exists, it is just not translated yet.
 */
export function resolveHref(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  return hasTranslation(href) ? localeHref(locale, href) : href;
}

/** The same page in the other language, for the header switch. */
export function alternateHref(locale: Locale, pathname: string): string {
  const { path } = splitLocale(pathname);
  const other: Locale = locale === "en" ? "es" : "en";
  return localeHref(other, path);
}

/**
 * Picks a locale-shaped value. Content records keep one entry per locale, so a
 * missing Spanish string is a type error rather than a silent English fallback.
 */
export type Localized<T> = Record<Locale, T>;

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
