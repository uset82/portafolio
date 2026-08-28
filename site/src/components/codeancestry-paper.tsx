import { ActionLink, StatusTag } from "@/components/ui";
import { localizeCodeAncestry } from "@/content/i18n/codeancestry-es";
import type { PaperEntry } from "@/content/codeancestry";
import { resolveHref, type Locale } from "@/lib/i18n";

type CodeAncestryPaperProps = {
  locale?: Locale;
};

/**
 * A numbered register of ideas, reused by six sections of the paper.
 *
 * The paper is long, and its sections are all the same shape underneath: a
 * term, a line of orientation, and a paragraph. Drawing them with one list
 * keeps the reading rhythm identical from the vocabulary through to the limits,
 * so the page reads as one argument rather than as nine stacked components.
 */
function PaperRegister({
  entries,
  label,
  modifier,
}: {
  entries: readonly PaperEntry[];
  label: string;
  modifier?: string;
}) {
  return (
    <ol
      className={
        modifier
          ? `codeancestry__entries codeancestry__entries--${modifier}`
          : "codeancestry__entries"
      }
      aria-label={label}
    >
      {entries.map((entry, index) => (
        <li key={entry.id} className="codeancestry__entry">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div className="codeancestry__entry-title">
            <h3>{entry.term}</h3>
            <p>{entry.gloss}</p>
          </div>
          <p className="codeancestry__entry-body">{entry.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function CodeAncestryPaper({ locale = "en" }: CodeAncestryPaperProps) {
  const paper = localizeCodeAncestry(locale);

  return (
    <main id="main-content" className="codeancestry">
      <section className="codeancestry__hero" aria-labelledby="codeancestry-title">
        <div className="codeancestry__rail">
          <p className="section-label">{paper.hero.label}</p>
          <StatusTag tone="concept">{paper.hero.statusLabel}</StatusTag>
        </div>

        <div className="codeancestry__identity">
          <p>{paper.hero.identity}</p>
          <h1 id="codeancestry-title">{paper.hero.title}</h1>
          <strong>{paper.hero.subtitle}</strong>
          <small>{paper.hero.attribution}</small>
        </div>

        <div className="codeancestry__abstract">
          <p>{paper.hero.lead}</p>
          <small>{paper.hero.boundary}</small>
        </div>

        {/* The lineage figure from the paper, drawn in CSS: a root genome, two
         * descendants, and one proposal travelling back up. It carries no
         * information the prose does not, so it stays out of the accessibility
         * tree rather than being narrated twice. */}
        <div className="codeancestry__lineage" aria-hidden="true">
          <span>{paper.hero.markLabel}</span>
          <div className="codeancestry__lineage-graph">
            <b className="codeancestry__lineage-root" />
            <i className="codeancestry__lineage-edge codeancestry__lineage-edge--left" />
            <i className="codeancestry__lineage-edge codeancestry__lineage-edge--right" />
            <b className="codeancestry__lineage-child codeancestry__lineage-child--left" />
            <b className="codeancestry__lineage-child codeancestry__lineage-child--right" />
            <i className="codeancestry__lineage-return" />
          </div>
          <small>{paper.hero.markCaption}</small>
        </div>
      </section>

      <section className="codeancestry__origin" aria-labelledby="codeancestry-origin-title">
        <header>
          <p className="section-label">{paper.origin.label}</p>
          <h2 id="codeancestry-origin-title">{paper.origin.heading}</h2>
        </header>

        <div className="codeancestry__body">
          <div className="codeancestry__prose">
            {paper.origin.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <figure className="codeancestry__question">
            <blockquote>
              <p>{paper.origin.question}</p>
            </blockquote>
            <figcaption>{paper.origin.questionCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-model-title">
        <header>
          <p className="section-label">{paper.vocabulary.label}</p>
          <h2 id="codeancestry-model-title">{paper.vocabulary.heading}</h2>
          <p>{paper.vocabulary.body}</p>
        </header>
        <PaperRegister entries={paper.vocabulary.entries} label={paper.vocabulary.aria} />
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-modes-title">
        <header>
          <p className="section-label">{paper.modes.label}</p>
          <h2 id="codeancestry-modes-title">{paper.modes.heading}</h2>
          <p>{paper.modes.body}</p>
        </header>
        <PaperRegister entries={paper.modes.entries} label={paper.modes.aria} modifier="compact" />
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-agent-title">
        <header>
          <p className="section-label">{paper.agent.label}</p>
          <h2 id="codeancestry-agent-title">{paper.agent.heading}</h2>
          <p>{paper.agent.body}</p>
        </header>

        <div className="codeancestry__body">
          <p className="codeancestry__subhead">{paper.agent.manifestLabel}</p>
          <PaperRegister
            entries={paper.agent.manifest}
            label={paper.agent.manifestAria}
            modifier="compact"
          />
          <p className="codeancestry__closing-note">{paper.agent.neutrality}</p>
        </div>
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-propagation-title">
        <header>
          <p className="section-label">{paper.propagation.label}</p>
          <h2 id="codeancestry-propagation-title">{paper.propagation.heading}</h2>
          <p>{paper.propagation.body}</p>
        </header>

        <div className="codeancestry__body">
          <p className="codeancestry__subhead">{paper.propagation.pipelineLabel}</p>
          <ol className="codeancestry__pipeline" aria-label={paper.propagation.pipelineAria}>
            {paper.propagation.pipeline.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>

          <p className="codeancestry__subhead">{paper.propagation.fitnessLabel}</p>
          <p className="codeancestry__prose-line">{paper.propagation.fitnessBody}</p>
          <dl className="codeancestry__fitness" aria-label={paper.propagation.fitnessAria}>
            {paper.propagation.fitness.map((dimension) => (
              <div key={dimension.id}>
                <dt>
                  <b aria-hidden="true">{dimension.term}</b>
                  {dimension.gloss}
                </dt>
                <dd>{dimension.body}</dd>
              </div>
            ))}
          </dl>

          <p className="codeancestry__subhead">{paper.propagation.guardrailsLabel}</p>
          <PaperRegister
            entries={paper.propagation.guardrails}
            label={paper.propagation.guardrailsAria}
            modifier="compact"
          />
        </div>
      </section>

      <section
        className="codeancestry__section codeancestry__section--stack"
        aria-labelledby="codeancestry-architecture-title"
      >
        <header>
          <p className="section-label">{paper.architecture.label}</p>
          <h2 id="codeancestry-architecture-title">{paper.architecture.heading}</h2>
          <p>{paper.architecture.body}</p>
        </header>

        <ol className="codeancestry__layers" aria-label={paper.architecture.aria}>
          {paper.architecture.layers.map((layer, index) => (
            <li key={layer.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{layer.term}</h3>
                <p>{layer.gloss}</p>
              </div>
              <p>{layer.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-roadmap-title">
        <header>
          <p className="section-label">{paper.roadmap.label}</p>
          <h2 id="codeancestry-roadmap-title">{paper.roadmap.heading}</h2>
          <p>{paper.roadmap.body}</p>
        </header>
        <PaperRegister entries={paper.roadmap.phases} label={paper.roadmap.aria} />
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-questions-title">
        <header>
          <p className="section-label">{paper.questions.label}</p>
          <h2 id="codeancestry-questions-title">{paper.questions.heading}</h2>
          <p>{paper.questions.body}</p>
        </header>

        <ol className="codeancestry__questions" aria-label={paper.questions.aria}>
          {paper.questions.items.map((item) => (
            <li key={item.id}>
              <span>{item.id.toUpperCase()}</span>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="codeancestry__section" aria-labelledby="codeancestry-limits-title">
        <header>
          <p className="section-label">{paper.limits.label}</p>
          <h2 id="codeancestry-limits-title">{paper.limits.heading}</h2>
          <p>{paper.limits.body}</p>
        </header>

        <div className="codeancestry__body">
          <PaperRegister
            entries={paper.limits.items}
            label={paper.limits.aria}
            modifier="compact"
          />

          <p className="codeancestry__subhead">{paper.limits.ledgerLabel}</p>
          <dl className="codeancestry__ledger">
            {paper.limits.ledger.map((item, index) => (
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
        </div>
      </section>

      <section className="codeancestry__continuation" aria-labelledby="codeancestry-close-title">
        <div className="codeancestry__continuation-copy">
          <p className="section-label">{paper.close.label}</p>
          <h2 id="codeancestry-close-title">{paper.close.heading}</h2>
          <p>{paper.close.body}</p>
        </div>

        <nav aria-label={paper.close.aria}>
          <ActionLink variant="primary" href={resolveHref(locale, "/laboratory")}>
            {paper.close.backToLaboratory}
          </ActionLink>
          <ActionLink variant="secondary" href={resolveHref(locale, "/work")}>
            {paper.close.exploreWork}
          </ActionLink>
          <ActionLink variant="secondary" href={resolveHref(locale, "/contact")}>
            {paper.close.visitContact}
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
