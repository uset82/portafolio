import { ActionLink } from "@/components/ui";
import { CosmosMark } from "@/components/cosmos-mark";
import { COSMOS_APPS } from "@/content/cosmos";
import { ui } from "@/content/i18n/ui";
import type { SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type PersonalTeaserProps = {
  content: SiteMetadata["personalTeaser"];
  locale?: Locale;
};

const themeHref = (theme: string) =>
  COSMOS_APPS.find((app) => app.name === theme)?.repository ?? null;

export function PersonalTeaser({ content, locale = "en" }: PersonalTeaserProps) {
  const copy = ui(locale).personalTeaser;
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
        <ul className="personal-teaser__themes" aria-label={copy.themesAria}>
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
          {COSMOS_APPS.map((app) =>
            app.tryUrl && app.tryLabel ? (
              <ActionLink
                key={app.id}
                className="personal-teaser__action"
                href={app.tryUrl}
                rel="noreferrer"
                target="_blank"
              >
                {app.tryLabel} <span aria-hidden="true">↗</span>
              </ActionLink>
            ) : null,
          )}
          <ActionLink
            className="personal-teaser__action"
            href={resolveHref(locale, content.action.href)}
          >
            {content.action.label} <span aria-hidden="true">→</span>
          </ActionLink>
        </div>
      </div>

      <div className="personal-teaser__field" aria-hidden="true">
        <span className="personal-teaser__field-label">{copy.fieldLabel}</span>
        <CosmosMark className="personal-teaser__mark" />
        <div className="personal-teaser__legend">
          {content.themes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
        <small>{copy.bothOpen}</small>
      </div>
    </section>
  );
}
