import { ActionLink } from "@/components/ui";
import { COSMOS_APPS, pinaculoApp } from "@/content/cosmos";
import type { SiteMetadata } from "@/content/schemas";

type PersonalTeaserProps = {
  content: SiteMetadata["personalTeaser"];
};

const themeHref = (theme: string) =>
  COSMOS_APPS.find((app) => app.name === theme)?.repository ?? null;

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
        <ul className="personal-teaser__themes" aria-label="Apps and practices in Cosmos">
          {content.themes.map((theme, index) => {
            const href = themeHref(theme);
            return (
              <li key={theme}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {href ? (
                  <a
                    className="personal-teaser__theme-link"
                    href={href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {theme}
                  </a>
                ) : (
                  theme
                )}
              </li>
            );
          })}
        </ul>
        <div className="personal-teaser__actions">
          {pinaculoApp.tryUrl ? (
            <ActionLink
              className="personal-teaser__action"
              href={pinaculoApp.tryUrl}
              rel="noreferrer"
              target="_blank"
            >
              {pinaculoApp.tryLabel} <span aria-hidden="true">↗</span>
            </ActionLink>
          ) : null}
          <ActionLink className="personal-teaser__action" href={content.action.href}>
            {content.action.label} <span aria-hidden="true">→</span>
          </ActionLink>
        </div>
      </div>

      <div className="personal-teaser__field" aria-hidden="true">
        <span className="personal-teaser__field-label">Cosmos / apps</span>
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
          <span>ASTROEA</span>
          <span>Pináculo</span>
          <span>Travel</span>
        </div>
        <small>Pináculo is open to try</small>
      </div>
    </section>
  );
}
