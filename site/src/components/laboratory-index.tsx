import { ActionLink, StatusTag } from "@/components/ui";
import type { Project } from "@/content/schemas";

type ConceptProject = Extract<Project, { status: "concept" | "preparation" }>;

type LaboratoryIndexProps = {
  futureEnergy: ConceptProject;
};

const electronicsConcept = {
  title: "Electronics / AI",
  descriptor: "Protected modular systems",
  status: "Concept only",
  summary:
    "A visual and navigational Laboratory concept for modular electronics and AI work—not a functioning computer, proprietary board, trained model, or live system.",
  boundary:
    "No hardware performance, AI inference, live data, product availability, or ownership of a manufactured device is claimed.",
} as const;

const publicationBoundaries = [
  {
    label: "Evidence state",
    value: "Concept",
    detail:
      "The public record contains visual and navigational concepts, not completed project proof.",
  },
  {
    label: "Hardware state",
    value: "Not represented as built",
    detail:
      "No working battery, electronics unit, chemistry, pressure rating, or physical prototype is claimed.",
  },
  {
    label: "Software and data",
    value: "No live system",
    detail:
      "No inference, model output, telemetry, connected device, or real-time data is running here.",
  },
  {
    label: "Media and links",
    value: "Held for evidence",
    detail:
      "External demos, repositories, photographs, and measurements remain absent until verified.",
  },
] as const;

export function LaboratoryIndex({ futureEnergy }: LaboratoryIndexProps) {
  return (
    <main id="main-content" className="laboratory-index">
      <section className="laboratory-index__hero" aria-labelledby="laboratory-index-title">
        <div className="laboratory-index__rail">
          <p className="section-label">Laboratory / Concept register</p>
          <StatusTag tone="concept">Evidence boundary active</StatusTag>
        </div>

        <div className="laboratory-index__identity">
          <p>Software, energy, and electronics</p>
          <h1 id="laboratory-index-title">Experiments where software meets matter.</h1>
          <strong>
            A working index for future energy and electronics / AI concepts in the Observatory.
          </strong>
          <small>
            This page separates designed mechanisms from evidence-backed projects. Nothing here
            implies functioning hardware, live AI, measured performance, or a public product.
          </small>
        </div>

        <div className="laboratory-index__bench" aria-hidden="true">
          <span>Open bench / 04</span>
          <div className="laboratory-index__vessels">
            <i />
            <i />
            <b />
          </div>
          <div className="laboratory-index__module">
            <i />
            <i />
            <i />
            <b />
          </div>
          <strong>02</strong>
          <small>Concept mechanisms · no live data</small>
        </div>
      </section>

      <section className="laboratory-index__register" aria-labelledby="laboratory-register-title">
        <header>
          <p className="section-label">Current register / 01</p>
          <h2 id="laboratory-register-title">Two mechanisms, each with a visible limit.</h2>
          <p>
            Both entries are part of the approved Observatory composition. Only Future Energy has a
            held case-study route; Electronics / AI remains an in-scene concept without a separate
            project claim.
          </p>
        </header>

        <ol aria-label="Laboratory concepts">
          <li className="laboratory-index__entry laboratory-index__entry--energy">
            <span>01</span>
            <div className="laboratory-index__entry-title">
              <p>{futureEnergy.tagline}</p>
              <h3>{futureEnergy.title}</h3>
              <StatusTag tone="concept">{futureEnergy.status}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{futureEnergy.conceptStatement}</p>
              <small>{futureEnergy.summary}</small>
            </div>
            <ActionLink href={`/work/${futureEnergy.slug}`}>
              View held case study <span aria-hidden="true">→</span>
            </ActionLink>
            <div className="laboratory-index__energy-mark" aria-hidden="true">
              <i />
              <i />
              <b />
            </div>
          </li>

          <li className="laboratory-index__entry laboratory-index__entry--electronics">
            <span>02</span>
            <div className="laboratory-index__entry-title">
              <p>{electronicsConcept.descriptor}</p>
              <h3>{electronicsConcept.title}</h3>
              <StatusTag tone="hold">{electronicsConcept.status}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{electronicsConcept.summary}</p>
              <small>{electronicsConcept.boundary}</small>
            </div>
            <p className="laboratory-index__no-link">No separate public project route</p>
            <div className="laboratory-index__electronics-mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <b />
            </div>
          </li>
        </ol>
      </section>

      <section className="laboratory-index__scope" aria-labelledby="laboratory-scope-title">
        <header>
          <p className="section-label">Evidence ledger / 02</p>
          <h2 id="laboratory-scope-title">Designed as concepts. Published with restraint.</h2>
          <p>
            The Laboratory can describe its intended visual language and public navigation. It
            cannot substitute those intentions for source material, working demonstrations, or
            measured outcomes.
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

      <section className="laboratory-index__continuation" aria-labelledby="laboratory-next-title">
        <div className="laboratory-index__continuation-mark" aria-hidden="true">
          <span>Runtime / static</span>
          <strong>LAB</strong>
          <i />
          <small>Semantic route remains complete</small>
        </div>

        <div className="laboratory-index__continuation-copy">
          <p className="section-label">Continue / 03</p>
          <h2 id="laboratory-next-title">Follow the evidence, not the machinery.</h2>
          <p>
            Work contains the currently validated concept records. Contact provides the approved
            public path without implying a product enquiry, demonstration request, or open
            engagement.
          </p>
          <nav aria-label="Laboratory route alternatives">
            <ActionLink variant="primary" href="/work">
              Explore Work
            </ActionLink>
            <ActionLink variant="secondary" href="/contact">
              Visit Contact
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
