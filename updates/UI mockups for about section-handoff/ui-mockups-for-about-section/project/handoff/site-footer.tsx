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
 * The close — direction 1b.
 *
 * The invitation moved down here from About. Above, the parchment section ends
 * on the CV link; the dark band opens with the ask, and the signature row sits
 * under it. One ending, on one surface, instead of two competing ones.
 */
export function SiteFooter({ content, navigation, secondaryNavigation }: SiteFooterProps) {
  const inviteId = "footer-contact-title";
  // Contact is the action directly above. Listing it again in the route grid
  // put the same destination on the page twice, two inches apart.
  const alsoHere = secondaryNavigation.filter((item) => item.href !== content.primaryAction.href);

  return (
    <footer className="site-footer" aria-labelledby={inviteId}>
      <section className="site-footer__invite" aria-labelledby={inviteId}>
        <div>
          <p className="section-label">Work together</p>
          <h2 id={inviteId}>{content.heading}</h2>
        </div>
        <div>
          <p>{content.description}</p>
          <nav className="site-footer__actions" aria-label="Contact">
            <ActionLink variant="primary" href={content.primaryAction.href}>
              {content.primaryAction.label} <span aria-hidden="true">&#8594;</span>
            </ActionLink>
          </nav>
        </div>
      </section>

      <div className="site-footer__signature">
        <div className="site-footer__identity">
          <h2>
            Carlos Alfredo
            <br />
            Carpio Meza
          </h2>
          <p>Engineer · Inventor · Creative Technologist</p>
        </div>

        {/* Grouped rather than numbered 01–07: the four doors are a set, and the
         * rest are somewhere else entirely. One run of numbers implied a single
         * ordered list and hid that difference. */}
        <div className="site-footer__routes site-footer__routes--primary">
          <p>Start here</p>
          <nav aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__routes site-footer__routes--secondary">
          <p>Also here</p>
          <nav aria-label="Secondary footer navigation">
            {alsoHere.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__routes site-footer__external">
          <p>Elsewhere</p>
          <nav aria-label="Public profile">
            <Link href={content.secondaryAction.href} prefetch={false}>
              {content.secondaryAction.label} <span aria-hidden="true">&#8599;</span>
              <span className="visually-hidden"> — external site</span>
            </Link>
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
