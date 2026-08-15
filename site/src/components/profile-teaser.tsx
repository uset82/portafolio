import { ActionLink } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type ProfileTeaserProps = {
  content: SiteMetadata["profileTeaser"];
};

export function ProfileTeaser({ content }: ProfileTeaserProps) {
  const headingId = "profile-teaser-title";

  return (
    <section className="profile-teaser" aria-labelledby={headingId}>
      <div className="profile-teaser__copy">
        <header>
          <p className="section-label">About / 04</p>
          <p className="profile-teaser__role">{content.role}</p>
          <h2 id={headingId}>{content.heading}</h2>
        </header>

        {/* `content.biography` is what /story publishes in full. Printing it
         * here as well meant the click delivered nothing new, so the teaser
         * says what the page is for and lets the page do the telling. */}
        <p className="profile-teaser__biography">
          The practice behind all of it, and the CV that goes with it — written out rather than
          summarised here.
        </p>

        <div className="profile-teaser__threads">
          <p>Practice threads</p>
          {/* Three parallel threads, not three steps: numbering them implied an
           * order that does not exist. */}
          <ul>
            {content.practiceThreads.map((thread) => (
              <li key={thread}>{thread}</li>
            ))}
          </ul>
        </div>

        {/* The footer sits directly below this on every page and already
         * carries the GitHub link and its own CC mark. Repeating both here read
         * as two closing sections instead of one, so this keeps only the CV
         * route and lets the footer close the page. */}
        <nav className="profile-teaser__actions" aria-label="Profile and CV paths">
          <ActionLink variant="primary" href={content.primaryAction.href}>
            {content.primaryAction.label}
          </ActionLink>
        </nav>
      </div>
    </section>
  );
}
