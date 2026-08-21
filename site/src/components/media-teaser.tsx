import { ActionLink } from "@/components/ui";
import { ui } from "@/content/i18n/ui";
import type { SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type MediaTeaserProps = {
  content: SiteMetadata["mediaTeaser"];
  locale?: Locale;
};

export function MediaTeaser({ content, locale = "en" }: MediaTeaserProps) {
  const copy = ui(locale).mediaTeaser;
  const headingId = "media-teaser-title";

  return (
    <section className="media-teaser" aria-labelledby={headingId}>
      <div className="media-teaser__instrument" aria-hidden="true">
        <span className="media-teaser__instrument-label">{copy.instrumentLabel}</span>
        <svg className="media-teaser__mark" viewBox="0 0 96 96" focusable="false">
          <g className="media-teaser__vinyl">
            <circle className="media-teaser__disc" cx="48" cy="38" r="26" />
            <circle className="media-teaser__groove" cx="48" cy="38" r="20" />
            <circle className="media-teaser__groove" cx="48" cy="38" r="14" />
            <circle className="media-teaser__label" cx="48" cy="38" r="8" />
            <circle className="media-teaser__spindle" cx="48" cy="38" r="1.7" />
          </g>
          <g className="media-teaser__arm">
            <circle cx="76" cy="14" r="3.1" />
            <line x1="76" y1="14" x2="58" y2="32" />
            <rect x="54.6" y="29.6" width="5.4" height="3" rx="0.6" transform="rotate(-40 58 32)" />
          </g>
          <g className="media-teaser__wave">
            <rect className="media-teaser__bar" x="16" y="80" width="4" height="6" />
            <rect className="media-teaser__bar" x="24" y="74" width="4" height="12" />
            <rect className="media-teaser__bar" x="32" y="77" width="4" height="9" />
            <rect className="media-teaser__bar" x="40" y="71" width="4" height="15" />
            <rect className="media-teaser__bar" x="48" y="75" width="4" height="11" />
            <rect className="media-teaser__bar" x="56" y="72" width="4" height="14" />
            <rect className="media-teaser__bar" x="64" y="78" width="4" height="8" />
            <rect className="media-teaser__bar" x="72" y="74" width="4" height="12" />
            <rect className="media-teaser__bar" x="80" y="81" width="4" height="5" />
          </g>
        </svg>
        <small>{copy.pressPlay}</small>
      </div>

      <div className="media-teaser__copy">
        <p className="section-label">{content.eyebrow}</p>
        <p className="media-teaser__status">
          <span aria-hidden="true" />
          {content.status}
        </p>
        <h2 id={headingId}>{content.heading}</h2>
        <p className="media-teaser__description">{content.description}</p>
        <ul className="media-teaser__formats" aria-label={copy.formatsAria}>
          {content.formats.map((format, index) => (
            <li key={format}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {format}
            </li>
          ))}
        </ul>
        <ActionLink
          className="media-teaser__action"
          href={resolveHref(locale, content.action.href)}
        >
          {content.action.label} <span aria-hidden="true">→</span>
        </ActionLink>
      </div>
    </section>
  );
}
