import Link from "next/link";
import type { SiteMetadata } from "@/content/schemas";

type ProfileTeaserProps = {
  content: SiteMetadata["profileTeaser"];
};

/**
 * The closing section — Direction 4a ("One blend").
 *
 * Heading carries the section at full display scale, paired directly with the
 * concise practice statement and editorial link to explore the CV on /story.
 * Transitions directly into espresso via the gradient blend band.
 */
export function ProfileTeaser({ content }: ProfileTeaserProps) {
  const headingId = "profile-teaser-title";

  return (
    <section className="profile-teaser" aria-labelledby={headingId}>
      <div className="profile-teaser__surface">
        <div className="profile-teaser__copy">
          <h2 id={headingId} className="profile-teaser__heading">
            {renderHeading(content.heading, content.headingAccent)}
          </h2>

          <div className="profile-teaser__meta">
            <p className="profile-teaser__biography">
              The practice behind all of it, and the CV that goes with it — written out rather than
              summarised here.
            </p>
            <nav className="profile-teaser__actions" aria-label="Profile and CV path">
              <Link href={content.primaryAction.href} className="profile-teaser__link">
                {content.primaryAction.label} <span aria-hidden="true">→</span>
              </Link>
            </nav>
          </div>
        </div>

        <div className="profile-teaser__blend" aria-hidden="true" />
      </div>
    </section>
  );
}

/** Splits the heading around `accent` so the editorial italic emphasis stays clean. */
function renderHeading(heading: string, accent?: string) {
  if (!accent) return heading;
  const at = heading.indexOf(accent);
  if (at < 0) return heading;

  return (
    <>
      {heading.slice(0, at)}
      <em className="profile-teaser__accent">{accent}</em>
      {heading.slice(at + accent.length)}
    </>
  );
}
