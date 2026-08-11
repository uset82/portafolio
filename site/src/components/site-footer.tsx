import Link from "next/link";

import { ActionLink } from "@/components/ui";
import type { LinkRecord, SiteMetadata } from "@/content/schemas";

type SiteFooterProps = {
  content: SiteMetadata["footer"];
  navigation: Array<Pick<LinkRecord, "href" | "label">>;
};

export function SiteFooter({ content, navigation }: SiteFooterProps) {
  const footerNavigation = navigation.filter((item) => item.href !== content.primaryAction.href);
  const headingId = "footer-contact-title";

  return (
    <footer className="site-footer" aria-labelledby={headingId}>
      <div className="site-footer__lead">
        <p className="section-label">{content.eyebrow}</p>
        <p className="site-footer__status">
          <span aria-hidden="true" />
          {content.status}
        </p>
        <h2 id={headingId}>{content.heading}</h2>
        <p className="site-footer__description">{content.description}</p>
        <nav className="site-footer__actions" aria-label="Contact and public profile">
          <ActionLink variant="primary" href={content.primaryAction.href}>
            {content.primaryAction.label} <span aria-hidden="true">→</span>
          </ActionLink>
          <ActionLink variant="text" href={content.secondaryAction.href} prefetch={false}>
            {content.secondaryAction.label} <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> — external site</span>
          </ActionLink>
        </nav>
      </div>

      <div className="site-footer__signal" aria-hidden="true">
        <span>Contact study / 05</span>
        <strong>CC</strong>
        <div>
          <i />
          <i />
          <i />
        </div>
        <small>Verified paths only</small>
      </div>

      <div className="site-footer__routes">
        <p>Explore</p>
        <nav aria-label="Footer navigation">
          {footerNavigation.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="site-footer__note">
        © {new Date().getFullYear()} Carlos Alfredo Carpio Meza. Built as a semantic portfolio with
        an optional immersive layer.
      </p>
    </footer>
  );
}
