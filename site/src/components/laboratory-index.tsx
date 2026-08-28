import { ActionLink, StatusTag } from "@/components/ui";
import { CODEANCESTRY_HREF } from "@/content/codeancestry";
import { localizeCodeAncestry } from "@/content/i18n/codeancestry-es";
import { localizeLaboratory } from "@/content/i18n/laboratory-es";
import { ui } from "@/content/i18n/ui";
import { resolveHref, type Locale } from "@/lib/i18n";
import type { LaboratoryConcept, Project } from "@/content/schemas";

type ConceptProject = Extract<Project, { status: "concept" | "preparation" }>;
type ElectronicsConcept = Extract<LaboratoryConcept, { artifactId: "electronics-ai" }>;
type DroneConcept = Extract<LaboratoryConcept, { artifactId: "drone" }>;

type LaboratoryIndexProps = {
  locale?: Locale;
  futureEnergy: ConceptProject;
  electronicsConcept: ElectronicsConcept;
  droneConcept: DroneConcept;
};

export function LaboratoryIndex({
  futureEnergy,
  electronicsConcept,
  droneConcept,
  locale = "en",
}: LaboratoryIndexProps) {
  const copy = ui(locale).laboratory;
  const energy = localizeLaboratory(futureEnergy, electronicsConcept, droneConcept, locale);
  // The fourth thread is a paper rather than a mechanism, so it carries its own
  // content record instead of a Laboratory concept: it has no scene artifact,
  // and its boundary is about software claims rather than hardware ones.
  const codeAncestry = localizeCodeAncestry(locale).register;
  const publicationBoundaries = copy.boundaries;
  return (
    <main id="main-content" className="laboratory-index">
      <section className="laboratory-index__hero" aria-labelledby="laboratory-index-title">
        <div className="laboratory-index__rail">
          <p className="section-label">{copy.label}</p>
          <StatusTag tone="concept">{copy.boundaryActive}</StatusTag>
        </div>

        <div className="laboratory-index__identity">
          <p>{copy.identity}</p>
          <h1 id="laboratory-index-title">{copy.heading}</h1>
          <strong>{copy.lead}</strong>
          <small>{copy.note}</small>
        </div>

        <div className="laboratory-index__bench" aria-hidden="true">
          <span>{copy.benchLabel}</span>
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
          <strong>04</strong>
          <small>{copy.benchCaption}</small>
        </div>
      </section>

      <section className="laboratory-index__register" aria-labelledby="laboratory-register-title">
        <header>
          <p className="section-label">{copy.registerLabel}</p>
          <h2 id="laboratory-register-title">{copy.registerHeading}</h2>
          <p>{copy.registerBody}</p>
        </header>

        <ol aria-label={copy.conceptsAria}>
          <li className="laboratory-index__entry laboratory-index__entry--energy">
            <span>01</span>
            <div className="laboratory-index__entry-title">
              <p>{energy.futureEnergy.tagline}</p>
              <h3>{energy.futureEnergy.title}</h3>
              <StatusTag tone="concept">{futureEnergy.status}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{energy.futureEnergy.conceptStatement}</p>
              <small>{energy.futureEnergy.summary}</small>
            </div>
            <ActionLink href={`/work/${futureEnergy.slug}`}>
              {copy.viewHeldCaseStudy} <span aria-hidden="true">→</span>
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
              <p>{energy.electronics.descriptor}</p>
              <h3>{energy.electronics.title}</h3>
              <StatusTag tone="hold">{energy.electronics.statusLabel}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{energy.electronics.summary}</p>
              <small>{energy.electronics.boundary}</small>
            </div>
            <p className="laboratory-index__no-link">{copy.noRoute}</p>
            <div className="laboratory-index__electronics-mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <b />
            </div>
          </li>

          <li className="laboratory-index__entry laboratory-index__entry--aerial">
            <span>03</span>
            <div className="laboratory-index__entry-title">
              <p>{energy.drone.descriptor}</p>
              <h3>{energy.drone.title}</h3>
              <StatusTag tone="hold">{energy.drone.statusLabel}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{energy.drone.summary}</p>
              <small>{energy.drone.boundary}</small>
            </div>
            <p className="laboratory-index__no-link">{copy.noRoute}</p>
          </li>

          <li className="laboratory-index__entry laboratory-index__entry--lineage">
            <span>04</span>
            <div className="laboratory-index__entry-title">
              <p>{codeAncestry.descriptor}</p>
              <h3>CodeAncestry</h3>
              <StatusTag tone="concept">{codeAncestry.statusLabel}</StatusTag>
            </div>
            <div className="laboratory-index__entry-copy">
              <p>{codeAncestry.summary}</p>
              <small>{codeAncestry.boundary}</small>
            </div>
            <ActionLink href={resolveHref(locale, CODEANCESTRY_HREF)}>
              {codeAncestry.linkLabel} <span aria-hidden="true">→</span>
            </ActionLink>
            <div className="laboratory-index__lineage-mark" aria-hidden="true">
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
          <p className="section-label">{copy.ledgerLabel}</p>
          <h2 id="laboratory-scope-title">{copy.ledgerHeading}</h2>
          <p>{copy.ledgerBody}</p>
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
          <span>{copy.runtimeLabel}</span>
          <strong>LAB</strong>
          <i />
          <small>{copy.runtimeCaption}</small>
        </div>

        <div className="laboratory-index__continuation-copy">
          <p className="section-label">{copy.continueLabel}</p>
          <h2 id="laboratory-next-title">{copy.continueHeading}</h2>
          <p>{copy.continueBody}</p>
          <nav aria-label={copy.alternativesAria}>
            <ActionLink variant="primary" href={resolveHref(locale, "/work")}>
              {copy.exploreWork}
            </ActionLink>
            <ActionLink variant="secondary" href={resolveHref(locale, "/contact")}>
              {copy.visitContact}
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
