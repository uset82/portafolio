import Link from "next/link";

import { ActionLink, StatusTag } from "@/components/ui";
import {
  FLAGSHIP_PROJECTS,
  FLAGSHIP_REGISTER,
  flagshipThreads,
  type FlagshipProject,
} from "@/content/flagship";
import type { Project } from "@/content/schemas";

type WorkRegisterProps = {
  /** The concept-stage Observatory entries, kept in their own section. */
  concepts: readonly Project[];
};

function licenceLabel(project: FlagshipProject) {
  return project.license ?? "No licence file yet";
}

function ShippedCard({ project }: { project: FlagshipProject }) {
  const titleId = `flagship-${project.id}-title`;

  return (
    <li className="work-register__project">
      <article aria-labelledby={titleId}>
        <div className="work-register__project-head">
          <p>{project.thread}</p>
          <h3 id={titleId}>{project.name}</h3>
          <strong>{project.tagline}</strong>
        </div>

        <p className="work-register__project-body">{project.summary}</p>

        {project.contributionNote ? (
          <p className="work-register__project-note">{project.contributionNote}</p>
        ) : null}

        <dl className="work-register__project-spec">
          <div>
            <dt>Built with</dt>
            <dd>{project.languages.join(", ")}</dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd>{licenceLabel(project)}</dd>
          </div>
          <div>
            <dt>Last pushed</dt>
            <dd>{project.lastPushed}</dd>
          </div>
        </dl>

        <div className="work-register__project-actions">
          {project.liveUrl ? (
            <ActionLink variant="primary" href={project.liveUrl} target="_blank" rel="noreferrer">
              {project.liveLabel ?? "Open it"} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          ) : null}
          <ActionLink
            variant={project.liveUrl ? "secondary" : "primary"}
            href={project.repository}
            target="_blank"
            rel="noreferrer"
          >
            Read the source <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </div>
      </article>
    </li>
  );
}

export function WorkRegister({ concepts }: WorkRegisterProps) {
  const threads = flagshipThreads();
  const openSource = FLAGSHIP_PROJECTS.filter((project) => project.license === "MIT");

  return (
    <main id="main-content" className="work-register">
      <section className="work-register__hero" aria-labelledby="work-register-title">
        <div className="work-register__rail">
          <p className="section-label">{FLAGSHIP_REGISTER.eyebrow}</p>
          <StatusTag tone="ready">{FLAGSHIP_PROJECTS.length} built</StatusTag>
          <StatusTag tone="concept">{concepts.length} concepts</StatusTag>
        </div>

        <div className="work-register__identity">
          <p>{threads.length} threads, one practice</p>
          <h1 id="work-register-title">{FLAGSHIP_REGISTER.heading}</h1>
          <strong>
            Built work first, with its languages, its licence and its source. Concepts are kept
            separately below, so nothing designed reads as something shipped.
          </strong>
        </div>
      </section>

      <section className="work-register__shipped" aria-labelledby="work-register-shipped-title">
        <header>
          <p className="section-label">
            {FLAGSHIP_REGISTER.shipped.label} / {FLAGSHIP_REGISTER.shipped.index}
          </p>
          <h2 id="work-register-shipped-title">{FLAGSHIP_REGISTER.shipped.heading}</h2>
          <p>{FLAGSHIP_REGISTER.shipped.description}</p>
          <ul className="work-register__threads" aria-label="Threads across the register">
            {threads.map((thread) => (
              <li key={thread}>{thread}</li>
            ))}
          </ul>
        </header>

        <ul className="work-register__projects" aria-label="Built projects">
          {FLAGSHIP_PROJECTS.map((project) => (
            <ShippedCard key={project.id} project={project} />
          ))}
        </ul>

        <aside className="work-register__licensing">
          <p>
            {openSource.length} of these {FLAGSHIP_PROJECTS.length} carry an MIT licence, which
            means you can read, fork and build on them. The rest are readable on GitHub but have no
            licence file yet, so they stay all rights reserved until that changes.
          </p>
          <ActionLink href="/support">
            What you can contribute to <span aria-hidden="true">&#8594;</span>
          </ActionLink>
        </aside>
      </section>

      <section className="work-register__concepts" aria-labelledby="work-register-concepts-title">
        <header>
          <p className="section-label">
            {FLAGSHIP_REGISTER.concepts.label} / {FLAGSHIP_REGISTER.concepts.index}
          </p>
          <h2 id="work-register-concepts-title">{FLAGSHIP_REGISTER.concepts.heading}</h2>
          <p>{FLAGSHIP_REGISTER.concepts.description}</p>
        </header>

        <ol className="work-register__concept-list" aria-label="Concept entries">
          {concepts.map((project, index) => {
            const conceptTitleId = `work-concept-${project.id}-title`;

            return (
              <li key={project.id}>
                <article aria-labelledby={conceptTitleId}>
                  <span className="work-register__concept-index" aria-hidden="true">
                    {project.presentation?.index ?? String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="work-register__concept-identity">
                    <StatusTag tone="concept">Concept</StatusTag>
                    <h3 id={conceptTitleId}>{project.title}</h3>
                    <strong>{project.tagline}</strong>
                    <p>
                      {"conceptStatement" in project ? project.conceptStatement : project.summary}
                    </p>
                  </div>

                  <Link
                    className="work-register__concept-link"
                    href={`/work/${project.slug}`}
                    prefetch={false}
                  >
                    <span>Open concept</span>
                    <span aria-hidden="true">&#8594;</span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
