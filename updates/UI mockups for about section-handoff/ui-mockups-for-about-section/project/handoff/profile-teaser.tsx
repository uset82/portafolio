import { ActionLink } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type ProfileTeaserProps = {
  content: SiteMetadata["profileTeaser"];
};

/**
 * The closing section — direction 1b.
 *
 * The heading now carries the section at display scale instead of sitting in a
 * narrow right-hand column beside an empty half of the page, and the practice
 * threads read as three serif rows rather than three small pills.
 *
 * The invitation is no longer here: it lives at the top of the footer, where
 * the dark band gives it the contrast a closing action needs. `footer` is
 * therefore no longer a prop of this component.
 */
export function ProfileTeaser({ content }: ProfileTeaserProps) {
  const headingId = "profile-teaser-title";

  return (
    <section className="profile-teaser" aria-labelledby={headingId}>
      <div className="profile-teaser__copy">
        <header>
          <p className="section-label">About / 04</p>
          <p className="profile-teaser__role">{content.role}</p>
        </header>

        {/* If `profileTeaser.headingAccent` is added to the schema, the words it
         * names are wrapped in <em> and set in italic walnut. Until then the
         * heading prints plain, which is also a valid reading of the design. */}
        <h2 id={headingId}>{renderHeading(content.heading, content.headingAccent)}</h2>

        <div className="profile-teaser__lower">
          {/* Three parallel threads, not three steps: numbering them implied an
           * order that does not exist, so the numerals are labels, not ranks. */}
          <div className="profile-teaser__threads">
            <ul>
              {content.practiceThreads.map((thread, index) => (
                <li key={thread}>
                  <span>{thread}</span>
                  <span aria-hidden="true">
                    THREAD {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="profile-teaser__summary">
            {/* `content.biography` is what /story publishes in full. Printing it
             * here as well meant the click delivered nothing new. */}
            <p className="profile-teaser__biography">
              The practice behind all of it, and the CV that goes with it — written out rather
              than summarised here.
            </p>
            <nav className="profile-teaser__actions" aria-label="Profile and CV paths">
              <ActionLink variant="secondary" href={content.primaryAction.href}>
                {content.primaryAction.label} <span aria-hidden="true">&#8594;</span>
              </ActionLink>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Splits the heading once around `accent` so the emphasis stays in content. */
function renderHeading(heading: string, accent?: string) {
  if (!accent) return heading;
  const at = heading.indexOf(accent);
  if (at < 0) return heading;

  return (
    <>
      {heading.slice(0, at)}
      <em>{accent}</em>
      {heading.slice(at + accent.length)}
    </>
  );
}
