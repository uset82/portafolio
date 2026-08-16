import Link from "next/link";

import { ActionLink } from "@/components/ui";
import type { LinkRecord, SiteMetadata } from "@/content/schemas";

type FooterLink = Pick<LinkRecord, "href" | "label">;

type SiteFooterProps = {
  content: SiteMetadata["footer"];
  /** The four doors, in menu order. */
  navigation: FooterLink[];
  /** Everything reachable but not an arrival decision. */
  secondaryNavigation: FooterLink[];
};

/**
 * The signature bar.
 *
 * This was a second closing section: a heading larger than anything else on the
 * page, a status pill carrying internal project state, a decorative monogram,
 * and a duplicate GitHub link — all sitting directly under the About section,
 * which was also trying to close the page.
 *
 * The invitation moved into About, where a visitor is actually deciding. What
 * is left here is what a footer is for: knowing where you are, finding the rest
 * of the site, and one way to reach a person.
 */
export function SiteFooter({ content, navigation, secondaryNavigation }: SiteFooterProps) {
  const headingId = "footer-contact-title";
  // Contact is already the action above. Listing it again in the route grid put
  // the same destination on the page twice, two inches apart.
  const alsoHere = secondaryNavigation.filter((item) => item.href !== content.primaryAction.href);

  return (
    <footer className="site-footer" aria-labelledby={headingId}>
      <div className="site-footer__identity">
        <h2 id={headingId}>Carlos Alfredo Carpio Meza</h2>
        <p>Engineer · Inventor · Creative Technologist</p>
        <nav className="site-footer__actions" aria-label="Contact and public profile">
          <ActionLink variant="secondary" href={content.primaryAction.href}>
            {content.primaryAction.label} <span aria-hidden="true">&#8594;</span>
          </ActionLink>
          <ActionLink variant="text" href={content.secondaryAction.href} prefetch={false}>
            {content.secondaryAction.label} <span aria-hidden="true">&#8599;</span>
            <span className="visually-hidden"> — external site</span>
          </ActionLink>
        </nav>
      </div>

      <div className="site-footer__routes">
        {/* Grouped rather than numbered 01–07: the four doors are a set, and the
         * rest are somewhere else entirely. One run of numbers implied a single
         * ordered list and hid that difference. */}
        <div>
          <p>Start here</p>
          <nav aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p>Also here</p>
          <nav aria-label="Secondary footer navigation">
            {alsoHere.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <p className="site-footer__note">
        © {new Date().getFullYear()} Carlos Alfredo Carpio Meza. Built as a semantic portfolio with
        an optional immersive layer.
      </p>
    </footer>
  );
}
