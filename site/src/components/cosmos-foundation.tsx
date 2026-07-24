import { ActionLink, StatusTag } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type CosmosFoundationProps = {
  content: SiteMetadata["personalTeaser"];
};

const practiceDefinitions = [
  {
    index: "01",
    name: "Travel notes",
    boundary: "Publication format—not a claim that a specific journey is public.",
    requirements:
      "A selected first-person story, safe place and time granularity, reusable imagery, captions, alt text, and a privacy review.",
  },
  {
    index: "02",
    name: "Astrology studies",
    boundary: "Creative and personal study—not scientific, medical, or predictive advice.",
    requirements:
      "A Carlos-approved reflection, clear symbolic framing, reusable supporting media, and no claims about another person.",
  },
  {
    index: "03",
    name: "Numerology studies",
    boundary: "Symbolic practice—not evidence, diagnosis, certainty, or prediction.",
    requirements:
      "A Carlos-approved reflection, an explicit interpretive boundary, accessible notation, and verified media rights.",
  },
] as const;

const publicationBoundaries = [
  {
    label: "Story selection",
    value: "Not approved",
    detail: "No journey, event, reading, or personal account is represented as public.",
  },
  {
    label: "Place and time",
    value: "Withheld",
    detail: "No location, route, date, coordinate, or inferred movement is exposed.",
  },
  {
    label: "Images and rights",
    value: "Required",
    detail: "Original or reusable media needs permission, captions, and alt-text intent.",
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
          <StatusTag tone="hold">{content.status}</StatusTag>
        </div>

        <div className="cosmos-foundation__identity">
          <p>Observation without disclosure</p>
          <h1 id="cosmos-foundation-title">Personal systems for observing patterns and meaning.</h1>
          <strong>{content.heading}</strong>
          <small>{content.description}</small>
        </div>

        <div className="cosmos-foundation__atlas" aria-hidden="true">
          <span>Unmapped field / 03</span>
          <div className="cosmos-foundation__orbits">
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="cosmos-foundation__axis">
            <i />
            <i />
            <i />
          </div>
          <strong>—</strong>
          <small>No places or dates plotted</small>
        </div>
      </section>

      <section className="cosmos-foundation__practices" aria-labelledby="cosmos-practices-title">
        <header>
          <p className="section-label">Practice register / 01</p>
          <h2 id="cosmos-practices-title">Three future formats. No invented stories.</h2>
          <p>
            The register defines how approved personal material could appear. It does not present a
            trip, reading, location, date, image, or private reflection as already published.
          </p>
        </header>

        <ol aria-label="Cosmos practices in preparation">
          {practiceDefinitions.map((practice) => (
            <li key={practice.name}>
              <span>{practice.index}</span>
              <div>
                <p>Practice in preparation</p>
                <h3>{practice.name}</h3>
              </div>
              <p>{practice.boundary}</p>
              <small>{practice.requirements}</small>
              <i aria-hidden="true">↗</i>
            </li>
          ))}
        </ol>
      </section>

      <section className="cosmos-foundation__privacy" aria-labelledby="cosmos-privacy-title">
        <header>
          <p className="section-label">Publication boundary / 02</p>
          <h2 id="cosmos-privacy-title">Personal context needs a higher evidence bar.</h2>
          <p>
            A story enters this room only after Carlos chooses it, defines a safe level of detail,
            confirms the rights, and approves the reflection in its public form.
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
          <small>Privacy before place</small>
        </div>

        <div className="cosmos-foundation__boundary-copy">
          <p className="section-label">Available now / 03</p>
          <h2 id="cosmos-boundary-title">A clear frame, while the private record stays private.</h2>
          <p>{content.claimsBoundary}</p>
          <p>
            No gallery, map, address, date, coordinate, personal image, itinerary, reading, or
            predictive result is exposed. The approved professional work and public biography remain
            available through the routes below.
          </p>
          <nav aria-label="Cosmos route alternatives">
            <ActionLink variant="primary" href="/work">
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
