import Link from "next/link";

import { ActionLink } from "@/components/ui";
import type { LinkRecord, SiteMetadata } from "@/content/schemas";

type FooterLink = Pick<LinkRecord, "href" | "label">;

type SiteFooterProps = {
  content: SiteMetadata["footer"];
  /** Primary site routes. Defaults to the 4 main doors: Play, See, Listen, About */
  navigation?: FooterLink[];
  /** Secondary site routes. Defaults to Laboratory, Cosmos, Support */
  secondaryNavigation?: FooterLink[];
};

const DEFAULT_PRIMARY_NAV: FooterLink[] = [
  { label: "Play", href: "/arcade" },
  { label: "See", href: "/work" },
  { label: "Listen", href: "/sound" },
  { label: "About", href: "/story" },
];

const DEFAULT_SECONDARY_NAV: FooterLink[] = [
  { label: "Laboratory", href: "/laboratory" },
  { label: "Cosmos", href: "/cosmos" },
  { label: "Support", href: "/support" },
];

/**
 * Site footer — Direction 4a ("One blend").
 *
 * Sits directly on the espresso surface below the gradient blend.
 * Contains the invitation ask, contact action, divided navigation row,
 * and single signature line.
 */
export function SiteFooter({
  content,
  navigation = DEFAULT_PRIMARY_NAV,
  secondaryNavigation = DEFAULT_SECONDARY_NAV,
}: SiteFooterProps) {
  const headingId = "footer-contact-title";

  return (
    <footer className="site-footer" aria-labelledby={headingId}>
      <div className="site-footer__inner">
        <section className="site-footer__ask" aria-labelledby={headingId}>
          <h2 id={headingId} className="site-footer__heading">
            {content.heading}
          </h2>
          <div className="site-footer__action-row">
            <ActionLink
              variant="primary"
              href={content.primaryAction.href}
              className="site-footer__cta"
            >
              {content.primaryAction.label} <span aria-hidden="true">→</span>
            </ActionLink>
            <p className="site-footer__disclaimer">{content.description}</p>
          </div>
        </section>

        <div className="site-footer__nav-group">
          <div className="site-footer__nav-row">
            <nav className="site-footer__primary-nav" aria-label="Primary site navigation">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <nav className="site-footer__secondary-nav" aria-label="Explore and external links">
              {secondaryNavigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link
                href={content.secondaryAction.href}
                prefetch={false}
                className="site-footer__external-link"
              >
                {content.secondaryAction.label === "View GitHub"
                  ? "GitHub"
                  : content.secondaryAction.label}{" "}
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> — external site</span>
              </Link>
            </nav>
          </div>
        </div>

        <p className="site-footer__signature">
          © {new Date().getFullYear()} Carlos Alfredo Carpio Meza · Engineer · Inventor · Creative
          Technologist · Built as a semantic portfolio with an optional immersive layer.
        </p>
      </div>
    </footer>
  );
}
