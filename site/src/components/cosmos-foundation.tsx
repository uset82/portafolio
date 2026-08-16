import { ActionLink, StatusTag } from "@/components/ui";
import { CosmosMark } from "@/components/cosmos-mark";
import { COSMOS_APPS, COSMOS_CONTRIBUTE } from "@/content/cosmos";
import type { SiteMetadata } from "@/content/schemas";

type CosmosFoundationProps = {
  content: SiteMetadata["personalTeaser"];
};

export function CosmosFoundation({ content }: CosmosFoundationProps) {
  return (
    <main id="main-content" className="cosmos-foundation">
      <section className="cosmos-foundation__hero" aria-labelledby="cosmos-foundation-title">
        <div className="cosmos-foundation__rail">
          <p className="section-label">Cosmos / Personal practice</p>
          <StatusTag tone="neutral">{content.status}</StatusTag>
        </div>

        <div className="cosmos-foundation__identity">
          <p>Two apps you can try and read</p>
          <h1 id="cosmos-foundation-title">Personal systems for observing patterns and meaning.</h1>
          <strong>{content.heading}</strong>
          <small>{content.description}</small>
        </div>

        <div className="cosmos-foundation__atlas" aria-hidden="true">
          <span>Public apps / 02</span>
          <CosmosMark className="cosmos-foundation__mark" />
          <div className="cosmos-foundation__legend">
            {COSMOS_APPS.map((app) => (
              <span key={app.id}>{app.name}</span>
            ))}
          </div>
          <small>Both apps are open to try</small>
        </div>
      </section>

      <section className="cosmos-foundation__practices" aria-labelledby="cosmos-practices-title">
        <header>
          <p className="section-label">Practice register / 01</p>
          <h2 id="cosmos-practices-title">Two apps you can try and read.</h2>
          <p>
            ASTROEA and Pináculo are public work. This page points to them; it does not host them,
            embed them, or collect birth data. {COSMOS_CONTRIBUTE.body}
          </p>
        </header>

        <ol aria-label="Cosmos apps">
          {COSMOS_APPS.map((app, index) => (
            <li key={app.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{app.kind}</p>
                <h3>{app.name}</h3>
              </div>
              <p>{app.summary}</p>
              <small>{app.status}</small>
              <nav aria-label={`${app.name} links`}>
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
          <p className="section-label">Close / 02</p>
          <h2 id="cosmos-close-title">The apps are public. The private record stays private.</h2>
          <p>{content.claimsBoundary}</p>
          <p>
            This page does not collect names or birth dates, and it does not publish Carlos&apos;s
            charts, journeys, or dates. ASTROEA and Pináculo live on their own sites.
          </p>
        </div>

        <nav aria-label="Cosmos routes">
          {COSMOS_APPS.map((app, index) =>
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
          <ActionLink variant="secondary" href="/work">
            Explore Work
          </ActionLink>
          <ActionLink variant="secondary" href="/story">
            Read Story
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
