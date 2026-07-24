import { ActionLink } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type PersonalTeaserProps = {
  content: SiteMetadata["personalTeaser"];
};

export function PersonalTeaser({ content }: PersonalTeaserProps) {
  const headingId = "personal-teaser-title";

  return (
    <section className="personal-teaser" aria-labelledby={headingId}>
      <div className="personal-teaser__copy">
        <p className="section-label">{content.eyebrow}</p>
        <p className="personal-teaser__status">
          <span aria-hidden="true" />
          {content.status}
        </p>
        <h2 id={headingId}>{content.heading}</h2>
        <p className="personal-teaser__description">{content.description}</p>
        <p className="personal-teaser__boundary">{content.claimsBoundary}</p>
        <ul className="personal-teaser__themes" aria-label="Cosmos themes in preparation">
          {content.themes.map((theme, index) => (
            <li key={theme}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {theme}
            </li>
          ))}
        </ul>
        <ActionLink className="personal-teaser__action" href={content.action.href}>
          {content.action.label} <span aria-hidden="true">→</span>
        </ActionLink>
      </div>

      <div className="personal-teaser__field" aria-hidden="true">
        <span className="personal-teaser__field-label">Field notes / 03</span>
        <div className="personal-teaser__contours">
          <i />
          <i />
          <i />
        </div>
        <div className="personal-teaser__horizon">
          <i />
          <i />
          <i />
        </div>
        <div className="personal-teaser__legend">
          <span>Places</span>
          <span>Practice</span>
          <span>Patterns</span>
        </div>
        <small>Exact places and dates withheld</small>
      </div>
    </section>
  );
}
