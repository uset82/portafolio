import { ActionLink } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type MediaTeaserProps = {
  content: SiteMetadata["mediaTeaser"];
};

export function MediaTeaser({ content }: MediaTeaserProps) {
  const headingId = "media-teaser-title";

  return (
    <section className="media-teaser" aria-labelledby={headingId}>
      <div className="media-teaser__instrument" aria-hidden="true">
        <span className="media-teaser__instrument-label">Sound room</span>
        <div className="media-teaser__dial">
          <span>11</span>
          <span>22</span>
          <span>33</span>
        </div>
        <div className="media-teaser__score">
          {Array.from({ length: 9 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <small>Press play to hear it</small>
      </div>

      <div className="media-teaser__copy">
        <p className="section-label">Listen / 02</p>
        <p className="media-teaser__status">
          <span aria-hidden="true" />
          {content.status}
        </p>
        <h2 id={headingId}>{content.heading}</h2>
        <p className="media-teaser__description">{content.description}</p>
        <ul className="media-teaser__formats" aria-label="Planned media formats">
          {content.formats.map((format) => (
            <li key={format}>{format}</li>
          ))}
        </ul>
        <ActionLink className="media-teaser__action" href={content.action.href}>
          {content.action.label} <span aria-hidden="true">→</span>
        </ActionLink>
      </div>
    </section>
  );
}
