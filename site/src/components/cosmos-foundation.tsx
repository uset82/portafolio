import { ActionLink, StatusTag } from "@/components/ui";
import { CosmosMark } from "@/components/cosmos-mark";
import { COSMOS_APPS, COSMOS_CONTRIBUTE } from "@/content/cosmos";
import { COSMOS_CONTRIBUTE_ES, localizeCosmosApp } from "@/content/i18n/cosmos-es";
import { HOME_ES } from "@/content/i18n/records-es";
import { ui } from "@/content/i18n/ui";
import type { SiteMetadata } from "@/content/schemas";
import { resolveHref, type Locale } from "@/lib/i18n";

type CosmosFoundationProps = {
  content: SiteMetadata["personalTeaser"];
  locale?: Locale;
};

export function CosmosFoundation({ content: source, locale = "en" }: CosmosFoundationProps) {
  const copy = ui(locale).cosmos;
  const apps = COSMOS_APPS.map((app) => localizeCosmosApp(app, locale));
  const contribute = locale === "es" ? COSMOS_CONTRIBUTE_ES : COSMOS_CONTRIBUTE;
  const content = locale === "es" ? { ...source, ...HOME_ES.personalTeaser } : source;
  return (
    <main id="main-content" className="cosmos-foundation">
      <section className="cosmos-foundation__hero" aria-labelledby="cosmos-foundation-title">
        <div className="cosmos-foundation__rail">
          <p className="section-label">{copy.label}</p>
          <StatusTag tone="neutral">{content.status}</StatusTag>
        </div>

        <div className="cosmos-foundation__identity">
          <p>{copy.identity}</p>
          <h1 id="cosmos-foundation-title">{copy.heading}</h1>
          <strong>{content.heading}</strong>
          <small>{content.description}</small>
        </div>

        <div className="cosmos-foundation__atlas" aria-hidden="true">
          <span>{copy.atlasLabel}</span>
          <CosmosMark className="cosmos-foundation__mark" />
          <div className="cosmos-foundation__legend">
            {apps.map((app) => (
              <span key={app.id}>{app.name}</span>
            ))}
          </div>
          <small>{copy.bothOpen}</small>
        </div>
      </section>

      <section className="cosmos-foundation__practices" aria-labelledby="cosmos-practices-title">
        <header>
          <p className="section-label">{copy.registerLabel}</p>
          <h2 id="cosmos-practices-title">{copy.registerHeading}</h2>
          <p>
            {copy.registerBody} {contribute.body}
          </p>
        </header>

        <ol aria-label={copy.appsAria}>
          {apps.map((app, index) => (
            <li key={app.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{app.kind}</p>
                <h3>{app.name}</h3>
              </div>
              <p>{app.summary}</p>
              <small>{app.status}</small>
              <nav aria-label={copy.appLinksAria(app.name)}>
                {app.tryUrl && app.tryLabel ? (
                  <ActionLink href={app.tryUrl} rel="noreferrer" target="_blank">
                    {app.tryLabel} <span aria-hidden="true">↗</span>
                  </ActionLink>
                ) : null}
                <ActionLink href={app.repository} rel="noreferrer" target="_blank">
                  {app.repositoryLabel} <span aria-hidden="true">↗</span>
                </ActionLink>
              </nav>
            </li>
          ))}
        </ol>
      </section>

      <section className="cosmos-foundation__close" aria-labelledby="cosmos-close-title">
        <div className="cosmos-foundation__close-copy">
          <p className="section-label">{copy.closeLabel}</p>
          <h2 id="cosmos-close-title">{copy.closeHeading}</h2>
          <p>{content.claimsBoundary}</p>
          <p>{copy.closeBody}</p>
        </div>

        <nav aria-label={copy.routesAria}>
          {apps.map((app, index) =>
            app.tryUrl && app.tryLabel ? (
              <ActionLink
                key={app.id}
                variant={index === 0 ? "primary" : "secondary"}
                href={app.tryUrl}
                rel="noreferrer"
                target="_blank"
              >
                {app.tryLabel}
              </ActionLink>
            ) : null,
          )}
          <ActionLink variant="secondary" href={resolveHref(locale, "/work")}>
            {copy.exploreWork}
          </ActionLink>
          <ActionLink variant="secondary" href={resolveHref(locale, "/story")}>
            {copy.readStory}
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
