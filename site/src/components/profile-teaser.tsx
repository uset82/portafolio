import { ActionLink } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type ProfileTeaserProps = {
  content: SiteMetadata["profileTeaser"];
  /** The approved contact copy, so the close invites rather than trails off. */
  footer: SiteMetadata["footer"];
};

/**
 * The closing section.
 *
 * This used to be a thin card — a role, a heading, three bullets, one link —
 * followed immediately by a footer carrying a much larger heading, a second
 * GitHub link and a decorative mark. Two endings competed and neither landed.
 *
 * The invitation now lives here, where a visitor who has just read the work is
 * actually deciding whether to get in touch, and the footer below is a compact
 * signature rather than a second closing statement.
 */
export function ProfileTeaser({ content, footer }: ProfileTeaserProps) {
  const headingId = "profile-teaser-title";
  const inviteId = "profile-teaser-invite";

  return (
    <section className="profile-teaser" aria-labelledby={headingId}>
      <div className="profile-teaser__copy">
        <header>
          <p className="section-label">About / 04</p>
          <p className="profile-teaser__role">{content.role}</p>
          <h2 id={headingId}>{content.heading}</h2>
        </header>

        {/* `content.biography` is what /story publishes in full. Printing it
         * here as well meant the click delivered nothing new. */}
        <p className="profile-teaser__biography">
          The practice behind all of it, and the CV that goes with it — written out rather than
          summarised here.
        </p>

        <div className="profile-teaser__threads">
          {/* Three parallel threads, not three steps: numbering them implied an
           * order that does not exist. */}
          <ul>
            {content.practiceThreads.map((thread) => (
              <li key={thread}>{thread}</li>
            ))}
          </ul>
        </div>

        <nav className="profile-teaser__actions" aria-label="Profile and CV paths">
          <ActionLink variant="secondary" href={content.primaryAction.href}>
            {content.primaryAction.label}
          </ActionLink>
        </nav>
      </div>

      <aside className="profile-teaser__invite" aria-labelledby={inviteId}>
        <p className="section-label">Work together</p>
        <h3 id={inviteId}>{footer.heading}</h3>
        <p>{footer.description}</p>
        <ActionLink variant="primary" href={footer.primaryAction.href}>
          {footer.primaryAction.label} <span aria-hidden="true">&#8594;</span>
        </ActionLink>
      </aside>
    </section>
  );
}
