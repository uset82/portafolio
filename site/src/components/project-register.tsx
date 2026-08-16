import Link from "next/link";

import { ActionLink } from "@/components/ui";
import {
  GITHUB_REGISTER_GROUPS,
  GITHUB_REGISTER_META,
  type GithubWorkEntry,
} from "@/content/github-register";

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function formatCount(count: number) {
  return String(count).padStart(2, "0");
}

function RepositoryRow({ repository, index }: { repository: GithubWorkEntry; index: number }) {
  const titleId = `project-register-${repository.id}-title`;
  const meta = [
    repository.kind === "fork" ? "Fork" : "Own",
    repository.language || null,
    repository.licenseLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="project-register__row" aria-labelledby={titleId}>
      <div className="project-register__index" aria-hidden="true">
        {formatIndex(index)}
      </div>

      <div className="project-register__identity">
        <p>{meta}</p>
        <h3 id={titleId}>{repository.title}</h3>
        <strong>{repository.description}</strong>
      </div>

      <div className="project-register__actions">
        {repository.tryUrl && repository.tryLabel ? (
          <a
            className="project-register__link"
            href={repository.tryUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span>{repository.tryLabel}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {repository.roomHref && repository.roomLabel ? (
          <Link className="project-register__link" href={repository.roomHref} prefetch={false}>
            <span>{repository.roomLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
        <a
          className="project-register__link"
          href={repository.url}
          rel="noreferrer"
          target="_blank"
        >
          <span>GitHub</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export function ProjectRegister() {
  const projectCount = formatCount(GITHUB_REGISTER_META.count);

  return (
    <main id="main-content" className="work-index">
      <section className="work-index__hero" aria-labelledby="work-index-title">
        <div className="work-index__rail">
          <p className="section-label">Work / Register</p>
          <p className="work-index__count">
            <span>{projectCount}</span>
            <small>public repositories</small>
          </p>
        </div>

        <h1 id="work-index-title">Work from 2022 to now.</h1>

        <div className="work-index__intro">
          <p>
            This is the work I have been building since 2022. You are welcome to try what is open,
            and to contribute. Private repositories stay off this page.
          </p>
          <nav className="work-index__welcome" aria-label="Try and contribute">
            <ActionLink variant="primary" href="/cosmos">
              Try
            </ActionLink>
            <ActionLink variant="secondary" href="/support">
              Contribute
            </ActionLink>
          </nav>
        </div>
      </section>

      <nav className="work-index__toc" aria-label="Work groups">
        {GITHUB_REGISTER_GROUPS.map((group) => (
          <a key={group.id} href={`#work-group-${group.id}`}>
            <span>{formatCount(group.repositories.length)}</span>
            <span>{group.title}</span>
          </a>
        ))}
      </nav>

      <div className="project-register project-register--github">
        {GITHUB_REGISTER_GROUPS.map((group) => {
          const titleId = `work-group-${group.id}-title`;

          return (
            <section
              key={group.id}
              id={`work-group-${group.id}`}
              className="project-register__group"
              aria-labelledby={titleId}
            >
              <header className="project-register__group-head">
                <p className="section-label">{group.chartLabel}</p>
                <h2 id={titleId}>{group.title}</h2>
                <p className="project-register__group-count">
                  <span>{formatCount(group.repositories.length)}</span>
                  <small>{group.repositories.length === 1 ? "repository" : "repositories"}</small>
                </p>
              </header>
              <ol className="project-register__list">
                {group.repositories.map((repository, index) => (
                  <li key={repository.id}>
                    <RepositoryRow repository={repository} index={index} />
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
