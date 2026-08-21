import Link from "next/link";

import { ActionLink } from "@/components/ui";
import { FOOTER_ES, linkLabelEs } from "@/content/i18n/records-es";
import { ui } from "@/content/i18n/ui";
import type { LinkRecord, SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type FooterLink = Pick<LinkRecord, "href" | "label">;

type SiteFooterProps = {
  content: SiteMetadata["footer"];
  locale?: Locale;
  /** Primary site routes. Defaults to the 4 main doors: Play, See, Listen, About */
  navigation?: FooterLink[];
  /** Secondary site routes. Defaults to Laboratory, Cosmos, Support */
  secondaryNavigation?: FooterLink[];
};

/**
 * Site footer — Direction 4a ("One blend").
 *
 * Sits directly on the espresso surface below the gradient blend.
 * Contains the invitation ask, contact action, divided navigation row,
 * and single signature line.
 */
export function SiteFooter({
  content,
  locale = "en",
  navigation,
  secondaryNavigation,
}: SiteFooterProps) {
  const headingId = "footer-contact-title";
  const copy = ui(locale);

  const primary: FooterLink[] = navigation ?? [
    { label: copy.footer.nav.play, href: "/arcade" },
    { label: copy.footer.nav.see, href: "/work" },
    { label: copy.footer.nav.listen, href: "/sound" },
    { label: copy.footer.nav.about, href: "/story" },
  ];

  const secondary: FooterLink[] = secondaryNavigation ?? [
    { label: copy.footer.nav.laboratory, href: "/laboratory" },
    { label: copy.footer.nav.cosmos, href: "/cosmos" },
    { label: copy.footer.nav.support, href: "/support" },
  ];

  const heading = locale === "es" ? FOOTER_ES.heading : content.heading;
  const primaryLabel =
    locale === "es"
      ? linkLabelEs(content.primaryAction.id, content.primaryAction.label)
      : content.primaryAction.label;
  const secondaryLabel =
    content.secondaryAction.label === "View GitHub" ? "GitHub" : content.secondaryAction.label;

  return (
    <footer className="site-footer" aria-labelledby={headingId}>
      <div className="site-footer__inner">
        <section className="site-footer__ask" aria-labelledby={headingId}>
          <h2 id={headingId} className="site-footer__heading">
            {heading}
          </h2>
          <div className="site-footer__action-row">
            <ActionLink
              variant="primary"
              href={resolveHref(locale, content.primaryAction.href)}
              className="site-footer__cta"
            >
              {primaryLabel} <span aria-hidden="true">→</span>
            </ActionLink>
          </div>
        </section>

        <div className="site-footer__nav-group">
          <div className="site-footer__nav-row">
            <nav className="site-footer__primary-nav" aria-label={copy.footer.primaryNavAria}>
              {primary.map((item) => (
                <Link key={item.href} href={resolveHref(locale, item.href)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <nav className="site-footer__secondary-nav" aria-label={copy.footer.secondaryNavAria}>
              {secondary.map((item) => (
                <Link key={item.href} href={resolveHref(locale, item.href)}>
                  {item.label}
                </Link>
              ))}
              <Link
                href={content.secondaryAction.href}
                prefetch={false}
                className="site-footer__external-link"
              >
                {secondaryLabel} <span aria-hidden="true">↗</span>
                <span className="visually-hidden">{copy.common.externalSite}</span>
              </Link>
            </nav>
          </div>
        </div>

        <p className="site-footer__signature">
          © {new Date().getFullYear()} {copy.footer.signature}
        </p>
      </div>
    </footer>
  );
}
