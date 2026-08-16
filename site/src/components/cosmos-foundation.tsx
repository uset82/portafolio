import { ActionLink, StatusTag } from "@/components/ui";
import { CosmosMark } from "@/components/cosmos-mark";
import { COSMOS_APPS, COSMOS_CONTRIBUTE } from "@/content/cosmos";
import type { SiteMetadata } from "@/content/schemas";

type CosmosFoundationProps = {
  content: SiteMetadata["personalTeaser"];
};

const publicationBoundaries = [
  {
    label: "Private journeys",
    value: "Unpublished",
    detail: "No journey, place, date, or personal travel account is represented as public.",
  },
  {
    label: "Birth data",
    value: "Not collected here",
    detail:
      "This portfolio does not collect names or birth dates. ASTROEA and Pináculo ask for that on their own sites.",
  },
  {
    label: "Private charts",
    value: "Unpublished",
    detail: "Carlos's own charts, readings, and dates are not published on this page.",
  },
  {
    label: "Claims boundary",
    value: "Locked",
    detail: "Symbolic practices remain personal and creative, never scientific or medical advice.",
  },
] as const;

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

      <section className="cosmos-foundation__privacy" aria-labelledby="cosmos-privacy-title">
        <header>
          <p className="section-label">Publication boundary / 02</p>
          <h2 id="cosmos-privacy-title">The apps are public. The private record stays private.</h2>
          <p>
            You can try both apps and read both repositories. Carlos&apos;s own charts and dates are
            not published here.
          </p>
        </header>

        <dl>
          {publicationBoundaries.map((item, index) => (
            <div key={item.label}>
              <dt>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </dt>
              <dd>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cosmos-foundation__boundary" aria-labelledby="cosmos-boundary-title">
        <div className="cosmos-foundation__boundary-mark" aria-hidden="true">
          <span>Public stories / 00</span>
          <strong>HOLD</strong>
          <i />
          <small>Private record unpublished</small>
        </div>

        <div className="cosmos-foundation__boundary-copy">
          <p className="section-label">Available now / 03</p>
          <h2 id="cosmos-boundary-title">Try the work, then look through the code.</h2>
          <p>{content.claimsBoundary}</p>
          <p>
            This page does not publish Carlos&apos;s private charts, journeys, or dates, and it does
            not collect birth data. Pináculo and ASTROEA live on their own sites and repositories.
          </p>
          <nav aria-label="Cosmos app routes">
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
          </nav>
          <nav aria-label="Cosmos route alternatives">
            <ActionLink variant="secondary" href="/work">
              Explore Work
            </ActionLink>
            <ActionLink variant="secondary" href="/story">
              Read Story
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
