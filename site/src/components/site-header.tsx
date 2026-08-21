"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ui } from "@/content/i18n/ui";
import { linkLabelEs } from "@/content/i18n/records-es";
import type { NavigationItem } from "@/content/site";
import { alternateHref, hasTranslation, localeHref, resolveHref, type Locale } from "@/lib/i18n";
import { OBSERVATORY_LIVE_CANVAS_PRESENTATION } from "@/lib/three/progressive-loading";

import { BrandMark } from "./brand-mark";

export function SiteHeader({
  navigation,
  locale,
}: {
  navigation: NavigationItem[];
  locale: Locale;
}) {
  const pathname = usePathname();
  const copy = ui(locale);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* The name is stacked on two lines so the full legal name fits the
         * header column without shrinking the type. The link's aria-label
         * still carries the whole name, so the visual split never reaches the
         * accessibility tree as two fragments. */}
        <Link className="identity" href={localeHref(locale, "/")} aria-label={copy.header.homeAria}>
          <BrandMark />
          <span className="identity__name">
            <span>Carlos Alfredo</span>
            <span>Carpio Meza</span>
          </span>
        </Link>

        {/* With the menu button and its drawer removed, this is the only header
         * navigation at every width, so it must never be display:none. Narrow
         * viewports scroll it sideways rather than hiding it. */}
        <nav className="desktop-navigation" aria-label={copy.header.primaryNavAria}>
          {navigation.map((item) => {
            const href = resolveHref(locale, item.href);
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const label = locale === "es" ? linkLabelEs(item.id, item.label) : item.label;
            return (
              <Link key={item.href} href={href} aria-current={active ? "page" : undefined}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__status">
          {/* The switch points at the same page in the other language, so a
           * reader who changes language keeps their place instead of being
           * dropped on a translated home page. */}
          {hasTranslation(pathname) ? (
            <Link
              className="quiet-control site-header__language"
              href={alternateHref(locale, pathname)}
              hrefLang={locale === "en" ? "es" : "en"}
              aria-label={copy.common.switchLanguageAria}
            >
              <span aria-hidden="true">◐</span>
              <span>{copy.common.switchLanguage}</span>
            </Link>
          ) : null}

          {/* The Experience settings anchor only exists while the live Canvas is
           * approved (U.20 currently holds it poster-authoritative). */}
          {OBSERVATORY_LIVE_CANVAS_PRESENTATION === "approved" ? (
            <Link
              className="quiet-control"
              href={`${localeHref(locale, "/")}#observatory-experience-settings`}
            >
              <span aria-hidden="true">◌</span>
              <span>{copy.header.experience}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
