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
          <p className="section-label">{content.eyebrow}</p>
          <p className="profile-teaser__role">{content.role}</p>
          <h2 id={headingId}>{content.heading}</h2>
        </header>

        <p className="profile-teaser__biography">{content.biography}</p>

        <div className="profile-teaser__threads">
          <p>Practice threads</p>
          <ul>
            {content.practiceThreads.map((thread, index) => (
              <li key={thread}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {thread}
              </li>
            ))}
          </ul>
        </div>

        <nav className="profile-teaser__actions" aria-label="Profile and CV paths">
          <ActionLink variant="primary" href={content.primaryAction.href}>
            {content.primaryAction.label}
          </ActionLink>
          <ActionLink variant="text" href={content.secondaryAction.href} prefetch={false}>
            {content.secondaryAction.label} <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> — external site</span>
          </ActionLink>
        </nav>
      </div>

      <div className="profile-teaser__mark" aria-hidden="true">
        <span>Profile study / 04</span>
        <strong>CC</strong>
        <i />
        <i />
        <small>Carlos Alfredo Carpio Meza</small>
      </div>
    </section>
  );
}
