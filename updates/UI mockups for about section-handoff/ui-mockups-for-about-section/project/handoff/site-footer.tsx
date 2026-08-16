import Link from "next/link";
import type { SiteMetadata } from "@/content/schemas";

type FooterLink = {
  href: string;
  label: string;
};

type SiteFooterProps = {
  content: SiteMetadata["footer"];
  navigation?: readonly FooterLink[];
  secondaryNavigation?: readonly FooterLink[];
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
 * The closing footer — Direction 4a ("One blend").
 * Sits on dark espresso following the parchment-to-espresso blend band.
 * Contains the direct ask, pill CTA, privacy note, split navigation doors, and copyright signature.
 */
export function SiteFooter({
  content,
  navigation = DEFAULT_PRIMARY_NAV,
  secondaryNavigation = DEFAULT_SECONDARY_NAV,
}: SiteFooterProps) {
  const contactTitleId = "footer-contact-title";

  return (
    <footer className="site-footer" aria-labelledby={contactTitleId}>
      <div className="site-footer__surface">
        {/* Top: The ask */}
        <div className="site-footer__ask">
          <p id={contactTitleId} className="site-footer__statement">
            Let’s turn a difficult idea into a working system.
          </p>

          <div className="site-footer__action-row">
            <Link href={content.contactAction.href} className="site-footer__cta">
              {content.contactAction.label} <span aria-hidden="true">→</span>
            </Link>
            <p className="site-footer__privacy">{content.privacyNote}</p>
          </div>
        </div>

        <div className="site-footer__divider" aria-hidden="true" />

        {/* Bottom: Navigation and copyright */}
        <div className="site-footer__nav-row">
          <nav className="site-footer__primary-nav" aria-label="Primary site navigation">
            <ul>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__secondary-group">
            <nav className="site-footer__secondary-nav" aria-label="Explore and external links">
              <ul>
                {secondaryNavigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
                <li>
                  <a
                    href={content.publicProfile.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="site-footer__ext-link"
                  >
                    {content.publicProfile.label}
                    <span className="sr-only"> (opens in new window, external site)</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </li>
              </ul>
            </nav>

            <p className="site-footer__copyright">
              <span className="site-footer__copy-mark">©</span> Carlos Alfredo Carpio Meza — Built
              as a working system
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
